import { NextResponse } from 'next/server';
import ollama from 'ollama';
import dbConnect from '@/lib/db';
import { Conversation } from '@/lib/models';

// Use Node.js runtime
export const runtime = 'nodejs';

// Set Ollama API URL from environment variables if available
if (process.env.OLLAMA_API_URL) {
  ollama.host = process.env.OLLAMA_API_URL;
}

// Maximum number of messages to send to the model
const MAX_MESSAGE_COUNT = 50;
// Maximum allowed size for each image (2MB)
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export async function POST(req) {
  try {
    const { messages, model, conversationId, saveConversation } = await req.json();

    // Validate required parameters
    if (!messages || !model) {
      return NextResponse.json(
        { error: "Both messages and model are required" },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages must be an array" },
        { status: 400 }
      );
    }
    
    // Limit message count to prevent overwhelmingly large requests
    const limitedMessages = messages.slice(-MAX_MESSAGE_COUNT);
    
    // Process messages to handle any images
    const processedMessages = limitedMessages.map(message => {
      // Validate message structure
      if (typeof message !== 'object' || !message.role || !['user', 'assistant', 'system'].includes(message.role)) {
        throw new Error(`Invalid message format: ${JSON.stringify(message)}`);
      }
      
      // If the message contains images, we need special handling
      if (message.images && message.images.length > 0) {
        // Array to hold processed base64 images
        const processedImages = [];
        
        // Validate and process each image
        message.images.forEach((image, idx) => {
          if (!image.startsWith('data:image/')) {
            throw new Error(`Invalid image format at index ${idx}. Must be a data URL.`);
          }
          
          // Extract only the base64 part without the data URL prefix
          const base64Data = image.split(',')[1];
          if (!base64Data) {
            throw new Error(`Invalid image data at index ${idx}. Could not extract base64 content.`);
          }
          
          // Estimate the size of the base64 data
          const estimatedSizeInBytes = Math.ceil(base64Data.length * 0.75);
          
          if (estimatedSizeInBytes > MAX_IMAGE_SIZE_BYTES) {
            throw new Error(`Image at index ${idx} exceeds maximum size of ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB`);
          }
          
          // Add only the base64 data to processed images
          processedImages.push(base64Data);
        });
        
        // For Ollama API, return with just the base64 encoded images without data URL prefix
        return {
          role: message.role,
          content: message.content || '',
          images: processedImages  // Only the base64 data, no data URL prefix
        };
      }
      
      return {
        role: message.role,
        content: message.content || ''
      };
    });

    try {
      // Get streaming response from Ollama
      const stream = await ollama.chat({
        model: model,
        messages: processedMessages,
        stream: true,  // Enable streaming
      });

      // Create a TransformStream to convert Ollama's stream format to SSE
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      // Track full assistant response for storing in DB
      let fullAssistantResponse = '';

      // Process the stream in the background
      (async () => {
        try {
          for await (const chunk of stream) {
            if (chunk.message?.content) {
              // Send each chunk as a Server-Sent Event
              const data = JSON.stringify({ content: chunk.message.content });
              await writer.write(new TextEncoder().encode(`data: ${data}\n\n`));
              
              // Accumulate the full response
              fullAssistantResponse += chunk.message.content;
            }
          }
          
          // Save conversation to database if requested
          if (saveConversation) {
            try {
              await dbConnect();
              
              // Create assistant message with the full response
              const assistantMessage = {
                role: 'assistant',
                content: fullAssistantResponse,
                createdAt: new Date()
              };
              
              let conversation;
              let lastUserMessage = messages[messages.length - 1];
              
              // If conversationId exists, update existing conversation
              if (conversationId) {
                conversation = await Conversation.findById(conversationId);
                if (conversation) {
                  // Add the last user message and the assistant response
                  const userMessage = {
                    role: lastUserMessage.role,
                    content: lastUserMessage.content,
                    images: lastUserMessage.images,
                    createdAt: new Date()
                  };
                  
                  conversation.messages.push(userMessage, assistantMessage);
                  conversation.updatedAt = new Date();
                  await conversation.save();
                } else {
                  // If conversationId was provided but not found, create new
                  conversation = await createNewConversation(model, messages, assistantMessage, lastUserMessage);
                }
              } 
              // Otherwise create a new conversation
              else {
                conversation = await createNewConversation(model, messages, assistantMessage, lastUserMessage);
              }
              
              // Include the saved conversationId in the final message
              const completionData = JSON.stringify({ 
                content: '', 
                conversationId: conversation?._id 
              });
              await writer.write(new TextEncoder().encode(`data: ${completionData}\n\n`));
            } catch (dbError) {
              console.error("Database error:", dbError);
            }
          }
          
          // Signal end of stream
          await writer.write(new TextEncoder().encode("data: [DONE]\n\n"));
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          await writer.write(new TextEncoder().encode(`data: ${JSON.stringify({ error: streamError.message })}\n\n`));
        } finally {
          await writer.close();
        }
      })();

      // Helper function to create a new conversation
      async function createNewConversation(model, messages, assistantMessage, lastUserMessage) {
        // Include only the last user message and the assistant response for a new conversation
        const userMessage = {
          role: lastUserMessage.role,
          content: lastUserMessage.content,
          images: lastUserMessage.images, 
          createdAt: new Date()
        };
        
        // Generate AI title
        let aiTitle = "New Conversation";
        try {
          const titleResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-title`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userMessage: lastUserMessage.content,
              assistantMessage: assistantMessage.content
            })
          });
          
          if (titleResponse.ok) {
            const { title } = await titleResponse.json();
            aiTitle = title;
          }
        } catch (titleError) {
          console.error("Error generating AI title:", titleError);
          // Use fallback title
          aiTitle = lastUserMessage.content 
            ? lastUserMessage.content.substring(0, 30) + (lastUserMessage.content.length > 30 ? '...' : '')
            : "New Conversation";
        }
        
        const conversation = new Conversation({
          title: aiTitle,
          model,
          messages: [userMessage, assistantMessage]
        });
        
        await conversation.save();
        return conversation;
      }

      // Return the readable stream as SSE
      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } catch (ollamaError) {
      console.error("Ollama API error:", ollamaError);
      throw ollamaError; // Re-throw for the outer catch to handle
    }
  } 
  catch (error) {
    console.error("Error in chat route:", error);
    
    // Provide more detailed error messages based on the type of error
    if (error.message?.includes('Invalid image format') || error.message?.includes('Invalid image data')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    } else if (error.message?.includes('exceeds maximum size')) {
      return NextResponse.json(
        { error: error.message },
        { status: 413 } // Payload Too Large
      );
    } else if (error.message?.includes('Invalid message format')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    } else if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request was aborted" },
        { status: 499 } // Client Closed Request
      );
    } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Failed to fetch')) {
      return NextResponse.json(
        { error: "Could not connect to Ollama server. Please ensure Ollama is running." },
        { status: 503 } // Service Unavailable
      );
    } else if (error.message?.includes('illegal base64')) {
      return NextResponse.json(
        { error: "Invalid base64 image data. Please check that your images are properly encoded." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "An error occurred during the chat request: " + error.message },
      { status: 500 }
    );
  }
}

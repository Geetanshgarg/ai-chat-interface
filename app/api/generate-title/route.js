import { NextResponse } from 'next/server';
import ollama from 'ollama';

// Use Node.js runtime
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { userMessage, assistantMessage } = await req.json();
    
    if (!userMessage) {
      return NextResponse.json(
        { error: "User message is required" },
        { status: 400 }
      );
    }
    
    // Create a prompt for the AI to generate a title
    const titlePrompt = `Based on this conversation, generate a short, descriptive title (maximum 4-5 words). Only respond with the title, no quotes or extra text.

User: ${userMessage.substring(0, 200)}${userMessage.length > 200 ? '...' : ''}
${assistantMessage ? `Assistant: ${assistantMessage.substring(0, 200)}${assistantMessage.length > 200 ? '...' : ''}` : ''}

Title:`;

    try {
      // Use Ollama to generate the title
      const response = await ollama.chat({
        model: 'gemma3:12b', // Use a fast model for title generation
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates short, descriptive chat titles. Always respond with only the title, no quotes, explanations, or extra text. Keep titles to 4-5 words maximum.'
          },
          {
            role: 'user',
            content: titlePrompt
          }
        ],
        stream: false
      });
      
      let title = response.message?.content?.trim() || 'New Conversation';
      
      // Clean up the title (remove quotes, limit length)
      title = title.replace(/['"]/g, '').trim();
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      // Fallback if title is empty or too generic
      if (!title || title.toLowerCase().includes('title') || title.length < 3) {
        title = userMessage.length > 0 
          ? userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '')
          : 'New Conversation';
      }
      
      return NextResponse.json({ title }, { status: 200 });
      
    } catch (ollamaError) {
      console.error("Ollama error generating title:", ollamaError);
      
      // Fallback title generation
      const fallbackTitle = userMessage.length > 0 
        ? userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '')
        : 'New Conversation';
        
      return NextResponse.json({ title: fallbackTitle }, { status: 200 });
    }
    
  } catch (error) {
    console.error("Error generating title:", error);
    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 500 }
    );
  }
}

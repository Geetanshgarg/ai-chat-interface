"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from 'next-themes'

// Components
import ConversationSidebar from "../components/chat/ConversationSidebar"
import ChatHeader from "../components/chat/ChatHeader"
import MessageList from "../components/chat/MessageList"
import ChatInput from "../components/chat/ChatInput"
import StatusIndicator from "../components/ui/StatusIndicator"

// Utils
import { generateId, formatTime } from "../utils/helpers"

export default function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState("gemma3:12b")
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [partialResponse, setPartialResponse] = useState("")
  const [images, setImages] = useState([])
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [showConversations, setShowConversations] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [dbStatus, setDbStatus] = useState({ status: 'unknown', message: 'Checking MongoDB connection...' })
  const [ollamaModels, setOllamaModels] = useState([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [modelsError, setModelsError] = useState(null)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const abortControllerRef = useRef(null)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const modelDropdownRef = useRef(null)
  
  // Theme setup
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // After mounting, we can show the theme toggle and fetch conversations
  useEffect(() => {
    setMounted(true)
    fetchConversations()
    testDbConnection()
    fetchAvailableModels()
  }, [])

  // Test MongoDB connection
  const testDbConnection = async () => {
    try {
      const response = await fetch("/api/db-test");
      const data = await response.json();
      
      if (response.ok) {
        setDbStatus({ 
          status: 'connected', 
          message: 'MongoDB connected successfully' 
        });
      } else {
        setDbStatus({ 
          status: 'error', 
          message: data.message || 'MongoDB connection failed' 
        });
      }
    } catch (error) {
      console.error("Error testing database connection:", error);
      setDbStatus({ 
        status: 'error', 
        message: 'Failed to test MongoDB connection' 
      });
    }
  };
  
  // Fetch available models from Ollama
  const fetchAvailableModels = async () => {
    try {
      setIsLoadingModels(true)
      setModelsError(null)
      
      const response = await fetch('/api/models')
      const data = await response.json()
      
      if (data.success) {
        setOllamaModels(data.models)
        // Set first available model as default if current selection is not available
        if (data.models.length > 0 && !data.models.includes(selectedModel)) {
          setSelectedModel(data.models[0])
        }
      } else {
        setModelsError(data.error)
        setOllamaModels(data.models) // Use fallback models
      }
    } catch (error) {
      console.error('Error fetching models:', error)
      setModelsError('Failed to fetch models')
      // Set fallback models
      setOllamaModels([
        "gemma3:12b",
        "mistralai/Mistral-7B-Instruct-v0.2",
        "llama3:8b", 
        "llama3:70b",
        "codellama:7b",
        "phi3:14b"
      ])
    } finally {
      setIsLoadingModels(false)
    }
  }

  // Fetch saved conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const { conversations } = await response.json();
        setConversations(conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsImageUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', files[0]);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const { imageData } = await response.json();
        setImages([...images, imageData]);
      } else {
        console.error('Error uploading image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsImageUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Remove an image
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  // Clear all images
  const clearImages = () => {
    setImages([]);
  };
  
  // Load a specific conversation
  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      
      if (response.ok) {
        const { conversation } = await response.json();
        setMessages(conversation.messages);
        setSelectedModel(conversation.model);
        setCurrentConversationId(conversation._id);
        setShowConversations(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };
  
  // Delete a conversation
  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation(); // Prevent triggering the load conversation event
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setConversations(conversations.filter(conv => conv._id !== conversationId));
        
        if (currentConversationId === conversationId) {
          clearChat();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, partialResponse])
  
  // Toggle conversations sidebar
  const toggleConversations = () => {
    setShowConversations(!showConversations);
  };

  // Start a new chat
  const startNewChat = () => {
    clearChat();
    setCurrentConversationId(null);
    setMessages([]);
    setPartialResponse("");
    setImages([]);
    inputRef.current?.focus();
    // Close the conversation sidebar if open
    if (showConversations) {
      setShowConversations(false);
    }
  };

  // Handle model selection
  const handleModelSelect = (model) => {
    setSelectedModel(model)
    setIsModelDropdownOpen(false)
    setMessages([])
    setPartialResponse("")
  }

  // Handle refresh models
  const handleRefreshModels = () => {
    setIsModelDropdownOpen(false)
    fetchAvailableModels()
  }

  // Handle stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      
      setMessages(prevMessages => [...prevMessages, {
        id: generateId(),
        role: "assistant",
        content: partialResponse,
        createdAt: new Date()
      }]);
      setPartialResponse("");
    }
  }

  // Handle form submission with streaming
  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!inputValue.trim() && images.length === 0) || isLoading) return

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController()
    
    // Add user message immediately with any attached images
    const userMessage = {
      id: generateId(),
      role: "user",
      content: inputValue,
      images: images.length > 0 ? [...images] : undefined,
      createdAt: new Date()
    }
    
    setMessages(prevMessages => [...prevMessages, userMessage])
    setInputValue("")
    setIsLoading(true)
    setPartialResponse("")
    setImages([]) // Clear images after sending
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
            images: msg.images
          })),
          model: selectedModel,
          conversationId: currentConversationId,
          saveConversation: true // Always save conversations
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""
      let savedConversationId = currentConversationId
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value)
        const lines = text.split('\n\n')
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue
          
          const data = line.replace('data: ', '').trim()
          
          if (data === '[DONE]') {
            // End of stream
            continue
          }
          
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              fullContent += parsed.content
              setPartialResponse(fullContent)
            }
            if (parsed.conversationId && !savedConversationId) {
              savedConversationId = parsed.conversationId
              setCurrentConversationId(savedConversationId)
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
      
      // Add the complete assistant response as a message
      if (fullContent) {
        setMessages(prevMessages => [...prevMessages, {
          id: generateId(),
          role: "assistant",
          content: fullContent,
          createdAt: new Date()
        }])
        setPartialResponse("")
      }
      
      // Refresh conversation list to show new/updated conversation
      fetchConversations()
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Chat error:", error)
        // Show error in UI
        setMessages(prevMessages => [...prevMessages, {
          id: generateId(),
          role: "system",
          content: "Sorry, there was an error processing your request. Please try again.",
          createdAt: new Date()
        }])
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
      // Focus the input field
      inputRef.current?.focus()
    }
  }

  // Clear chat history
  const clearChat = () => {
    setMessages([])
    setPartialResponse("")
    setCurrentConversationId(null)
    setImages([])
    inputRef.current?.focus()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setIsModelDropdownOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [modelDropdownRef])

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      <ConversationSidebar
        showConversations={showConversations}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onToggle={toggleConversations}
        onNewChat={startNewChat}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
      />
      
      <div className="flex flex-col flex-1">
        <ChatHeader
          theme={theme}
          setTheme={setTheme}
          mounted={mounted}
          selectedModel={selectedModel}
          isLoadingModels={isLoadingModels}
          modelsError={modelsError}
          ollamaModels={ollamaModels}
          isModelDropdownOpen={isModelDropdownOpen}
          setIsModelDropdownOpen={setIsModelDropdownOpen}
          modelDropdownRef={modelDropdownRef}
          onNewChat={startNewChat}
          onToggleConversations={toggleConversations}
          onClearChat={clearChat}
          onModelSelect={handleModelSelect}
          onRefreshModels={handleRefreshModels}
          hasMessages={messages.length > 0}
        />

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <MessageList
                messages={messages}
                partialResponse={partialResponse}
                isLoading={isLoading}
                selectedModel={selectedModel}
                onStopGeneration={handleStopGeneration}
                messagesEndRef={messagesEndRef}
                formatTime={formatTime}
              />
            </div>
          </div>
        </div>

        <ChatInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          images={images}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onClearImages={clearImages}
          isLoading={isLoading}
          isImageUploading={isImageUploading}
          inputRef={inputRef}
          fileInputRef={fileInputRef}
          selectedModel={selectedModel}
        />

        <StatusIndicator status={dbStatus} />
      </div>
    </div>
  )
}

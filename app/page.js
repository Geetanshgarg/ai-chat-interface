"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Trash2, Bot, User, RefreshCw, SquareX, Code, Moon, Sun, Image, X, History, PlusCircle } from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'

// Simple UUID generator function
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
// Function to format markdown text (bold, italic, lists, etc.)
function formatMarkdown(text) {
  if (!text) return null;
  
  // Handle bold
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle lists
  formattedText = formattedText.replace(/^\s*-\s+(.*)/gm, '<li>$1</li>');
  formattedText = formattedText.replace(/<li>(.*)<\/li>/g, '<ul class="list-disc ml-6 my-2">$&</ul>');
  
  // Handle numbered lists
  formattedText = formattedText.replace(/^\s*(\d+)\.\s+(.*)/gm, '<li>$2</li>');
  formattedText = formattedText.replace(/(<li>.*<\/li>)/g, '<ol class="list-decimal ml-6 my-2">$1</ol>');
  
  // Handle headings
  formattedText = formattedText.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-3">$1</h1>');
  formattedText = formattedText.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-2">$1</h2>');
  formattedText = formattedText.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>');
  
  // Handle links
  formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noreferrer">$1</a>');
  
  return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
}

// Function to copy code to clipboard
function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button
      onClick={handleCopy}
      className="text-xs flex items-center space-x-1 hover:text-white transition-colors"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

// Function to format message content with code highlighting
function formatMessageContent(content) {
  if (!content) return null;
  
  // Regular expression to detect markdown code blocks
  const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)\n```/g;
  
  // If there are no code blocks, just format as markdown and return
  if (!content.match(codeBlockRegex)) {
    return formatMarkdown(content);
  }
  
  // Split content by code blocks
  const segments = [];
  let lastIndex = 0;
  let match;
  let segmentId = 0;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: content.substring(lastIndex, match.index),
        id: segmentId++
      });
    }
    
    // Add the code block
    const language = match[1] || 'javascript';
    segments.push({
      type: 'code',
      language: language,
      content: match[2],
      id: segmentId++
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text after the last code block
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      content: content.substring(lastIndex),
      id: segmentId++
    });
  }
  
  // Render each segment appropriately
  return (
    <>
      {segments.map(segment => {
        if (segment.type === 'code') {
          return (
            <div key={segment.id} className="my-3 rounded-md overflow-hidden border border-gray-700 dark:border-gray-600 bg-gray-900 shadow-lg">
              <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-700 px-4 py-2 text-xs text-gray-200">
                <span className="font-mono">{segment.language}</span>
                <div className="flex items-center space-x-2">
                  <CopyButton code={segment.content} />
                  <Code className="h-4 w-4" />
                </div>
              </div>
              <SyntaxHighlighter
                language={segment.language}
                style={vscDarkPlus}
                className="rounded-b-md"
                customStyle={{ 
                  margin: 0,
                  padding: '1rem',
                  backgroundColor: 'rgb(17 24 39)',
                  fontSize: '0.9rem',
                  overflow: 'auto'
                }}
              >
                {segment.content}
              </SyntaxHighlighter>
            </div>
          );
        } else {
          return <div key={segment.id}>{formatMarkdown(segment.content)}</div>;
        }
      })}
    </>
  );
}

// Display uploaded images
function ImageGrid({ images, removeImage }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 my-2">
      {images.map((imageData, index) => (
        <div key={index} className="relative group">
          <img 
            src={imageData} 
            alt={`Uploaded image ${index + 1}`} 
            className="w-full h-auto rounded-md object-cover aspect-square"
          />
          <button
            onClick={() => removeImage(index)}
            className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// Conversation sidebar item
function ConversationItem({ conversation, onClick, onDelete, isActive }) {
  return (
    <div 
      onClick={onClick}
      className={`flex justify-between items-center p-3 cursor-pointer rounded-md my-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''
      }`}
    >
      <div className="flex-1 truncate">
        <div className="font-medium truncate">{conversation.title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(conversation.updatedAt).toLocaleDateString()}
        </div>
      </div>
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-red-500 ml-2"
        aria-label="Delete conversation"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// Status indicator for MongoDB connection
function StatusIndicator({ status }) {
  if (status.status === 'unknown') {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg shadow-md flex items-center space-x-2 opacity-80">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-600 dark:text-gray-300">{status.message}</span>
      </div>
    );
  } else if (status.status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg shadow-md flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-xs text-red-600 dark:text-red-400">{status.message}</span>
      </div>
    );
  } else if (status.status === 'connected') {
    return (
      <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/30 p-2 rounded-lg shadow-md flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-xs text-green-600 dark:text-green-400">{status.message}</span>
      </div>
    );
  }
  
  return null;
}

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

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
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
      {/* Conversations Sidebar */}
      {showConversations && (
        <div className="w-64 md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <button
              onClick={toggleConversations}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* New Chat button in the sidebar */}
          <button
            onClick={startNewChat}
            className="w-full mb-3 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8 border-t border-gray-200 dark:border-gray-700">
              No saved conversations yet
            </div>
          ) : (
            <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-3">
              {conversations.map(conversation => (
                <ConversationItem
                  key={conversation._id}
                  conversation={conversation}
                  onClick={() => loadConversation(conversation._id)}
                  onDelete={(e) => deleteConversation(conversation._id, e)}
                  isActive={currentConversationId === conversation._id}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Chat Assistant</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Ollama</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* New Chat button */}
              <button
                onClick={startNewChat}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                aria-label="Start new chat"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="text-sm">New Chat</span>
              </button>
            
              {/* Conversations button */}
              <button
                onClick={toggleConversations}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Conversations"
              >
                <History className="h-5 w-5" />
              </button>
              
              {/* Theme toggle button */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}
              
              {/* Model selector dropdown */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  onClick={() => setIsModelDropdownOpen(prev => !prev)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center space-x-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  disabled={isLoadingModels}
                >
                  <span>{isLoadingModels ? 'Loading models...' : selectedModel}</span>
                  {isLoadingModels ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {isModelDropdownOpen && !isLoadingModels && (
                  <div className="absolute z-10 left-0 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden border dark:border-gray-700">
                    {modelsError && (
                      <div className="px-4 py-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                        ⚠️ {modelsError} (using fallback models)
                      </div>
                    )}
                    <div className="py-1 max-h-60 overflow-y-auto">
                      {ollamaModels.map((model) => (
                        <button
                          key={model}
                          onClick={() => {
                            setSelectedModel(model)
                            setIsModelDropdownOpen(false)
                            setMessages([])
                            setPartialResponse("")
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            selectedModel === model 
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                              : 'text-gray-900 dark:text-gray-200'
                          }`}
                        >
                          {model}
                        </button>
                      ))}
                      
                      {ollamaModels.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No models available
                        </div>
                      )}
                      
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            setIsModelDropdownOpen(false)
                            fetchAvailableModels()
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          🔄 Refresh models
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Clear Chat</span>
              </button>
            )}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Welcome to Ollama Chat</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Start a conversation with our AI assistant. Currently using model: <span className="font-medium">{selectedModel}</span>
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600"
                          : "bg-gradient-to-r from-blue-500 to-purple-600"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 max-w-3xl ${message.role === "user" ? "text-right" : "text-left"}`}>
                      <div
                        className={`inline-block px-4 py-3 rounded-2xl ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {/* Text content */}
                        {message.content && (
                          <div className="whitespace-pre-wrap break-words">
                            {formatMessageContent(message.content)}
                          </div>
                        )}
                        
                        {/* Display images if present */}
                        {message.images && message.images.length > 0 && (
                          <div className={`mt-2 grid grid-cols-2 gap-2 ${!message.content ? 'mb-0' : ''}`}>
                            {message.images.map((img, idx) => (
                              <div key={idx} className="relative">
                                <img 
                                  src={img} 
                                  alt={`Attached image ${idx + 1}`}
                                  className="rounded-md w-full object-cover border border-white/20"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div
                        className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${message.role === "user" ? "text-right" : "text-left"}`}
                      >
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Streaming Response */}
              {partialResponse && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 max-w-3xl">
                    <div className="inline-block px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="whitespace-pre-wrap break-words">
                        {formatMessageContent(partialResponse)}
                      </div>
                    </div>
                    
                    {/* Stop Generation Button */}
                    {isLoading && (
                      <div className="mt-2">
                        <button 
                          onClick={() => {
                            if (abortControllerRef.current) {
                              abortControllerRef.current.abort();
                              setIsLoading(false);
                              
                              // Add the partial response as the final assistant message
                              setMessages(prevMessages => [...prevMessages, {
                                id: generateId(),
                                role: "assistant",
                                content: partialResponse,
                                createdAt: new Date()
                              }]);
                              setPartialResponse("");
                            }
                          }}
                          className="inline-flex items-center space-x-1 px-3 py-1 text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <SquareX className="w-3 h-3" />
                          <span>Stop generating</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Loading Indicator (only show if no partial response yet) */}
              {isLoading && !partialResponse && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Generating response...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Image preview grid */}
            {images.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">{images.length} image{images.length !== 1 ? 's' : ''} attached</h3>
                  <button
                    onClick={clearImages}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear all
                  </button>
                </div>
                <ImageGrid images={images} removeImage={removeImage} />
              </div>
            )}
          
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 min-h-[48px]"
                  rows="1"
                  disabled={isLoading}
                />
                
                {/* Image upload button */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  ref={fileInputRef}
                  disabled={isLoading || isImageUploading}
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isImageUploading}
                  className="absolute right-3 bottom-3 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-1 rounded-full transition-colors"
                >
                  {isImageUploading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Image className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || (!inputValue.trim() && images.length === 0)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Powered by Ollama - Using model: {selectedModel}
            </div>
          </div>
        </div>

        {/* Status Indicator - MongoDB Connection */}
        <StatusIndicator status={dbStatus} />
      </div>
    </div>
  )
}

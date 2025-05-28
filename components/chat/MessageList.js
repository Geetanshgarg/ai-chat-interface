import { Bot, User, RefreshCw, SquareX } from "lucide-react"
import { formatMessageContent } from "../../utils/messageFormatting"
import { generateId } from "../../utils/helpers"

export default function MessageList({
  messages,
  partialResponse,
  isLoading,
  selectedModel,
  onStopGeneration,
  messagesEndRef,
  formatTime
}) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Welcome to Ollama Chat</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Start a conversation with our AI assistant. Currently using model: <span className="font-medium">{selectedModel}</span>
        </p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start space-x-3 ${
            message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
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

          <div className={`flex-1 max-w-3xl ${message.role === "user" ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block px-4 py-3 rounded-2xl ${
                message.role === "user"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700"
              }`}
            >
              {message.content && (
                <div className="whitespace-pre-wrap break-words">
                  {formatMessageContent(message.content)}
                </div>
              )}
              
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

            <div
              className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${message.role === "user" ? "text-right" : "text-left"}`}
            >
              {formatTime(message.createdAt)}
            </div>
          </div>
        </div>
      ))}

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
            
            {isLoading && (
              <div className="mt-2">
                <button 
                  onClick={onStopGeneration}
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
      
      {/* Loading Indicator */}
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
    </>
  );
}

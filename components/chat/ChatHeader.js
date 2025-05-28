import { Bot, PlusCircle, History, Sun, Moon, Trash2, RefreshCw } from "lucide-react"

export default function ChatHeader({
  theme,
  setTheme,
  mounted,
  selectedModel,
  isLoadingModels,
  modelsError,
  ollamaModels,
  isModelDropdownOpen,
  setIsModelDropdownOpen,
  modelDropdownRef,
  onNewChat,
  onToggleConversations,
  onClearChat,
  onModelSelect,
  onRefreshModels,
  hasMessages
}) {
  return (
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
          <button
            onClick={onNewChat}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            aria-label="Start new chat"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="text-sm">New Chat</span>
          </button>
        
          <button
            onClick={onToggleConversations}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Conversations"
          >
            <History className="h-5 w-5" />
          </button>
          
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
          
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
                      onClick={() => onModelSelect(model)}
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
                      onClick={onRefreshModels}
                      className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      🔄 Refresh models
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {hasMessages && (
            <button
              onClick={onClearChat}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Clear Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { X, PlusCircle, Trash2 } from "lucide-react"

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

export default function ConversationSidebar({ 
  showConversations, 
  conversations, 
  currentConversationId,
  onToggle,
  onNewChat,
  onLoadConversation,
  onDeleteConversation
}) {
  if (!showConversations) return null;

  return (
    <div className="w-64 md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <button
        onClick={onNewChat}
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
              onClick={() => onLoadConversation(conversation._id)}
              onDelete={(e) => onDeleteConversation(conversation._id, e)}
              isActive={currentConversationId === conversation._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

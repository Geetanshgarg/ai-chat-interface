import { Send, RefreshCw, Image, X } from "lucide-react"

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

export default function ChatInput({
  inputValue,
  onInputChange,
  onSubmit,
  images,
  onImageUpload,
  onRemoveImage,
  onClearImages,
  isLoading,
  isImageUploading,
  inputRef,
  fileInputRef,
  selectedModel
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Image preview grid */}
        {images.length > 0 && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">{images.length} image{images.length !== 1 ? 's' : ''} attached</h3>
              <button
                onClick={onClearImages}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
            <ImageGrid images={images} removeImage={onRemoveImage} />
          </div>
        )}
      
        <form onSubmit={onSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={onInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSubmit(e)
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
              onChange={onImageUpload}
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
  );
}

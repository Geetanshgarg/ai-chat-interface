export default function StatusIndicator({ status }) {
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

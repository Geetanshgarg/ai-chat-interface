import { useState } from "react"
import { Code } from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Function to format markdown text (bold, italic, lists, etc.)
export function formatMarkdown(text) {
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
export function formatMessageContent(content) {
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

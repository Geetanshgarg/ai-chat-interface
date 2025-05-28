# Ollama Chat Interface

A modern, responsive chat interface for interacting with Ollama AI models. Built with Next.js and featuring real-time streaming, code highlighting, and dark mode support.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- [Ollama](https://ollama.ai/) installed and running locally
- At least one Ollama model pulled and available

### Ollama Setup

Before using the chat interface, you need to set up Ollama with models:

1. **Start Ollama service**:
   ```bash
   ollama serve
   ```

2. **Pull your desired models** (choose one or more):
   ```bash
   # Popular lightweight models
   ollama pull llama3.2:1b
   ollama pull phi3.5:3.8b
   
   # More capable models (requires more RAM)
   ollama pull llama3.2:3b
   ollama pull llama3.1:8b
   ollama pull codellama:7b
   ```

3. **Verify models are available**:
   ```bash
   ollama list
   ```

4. **Test Ollama API** (optional):
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ai-chat-interface

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Features

- **Real-time Chat**: Stream responses from any Ollama model
- **Code Highlighting**: Syntax highlighting with copy-to-clipboard functionality
- **Markdown Support**: Full markdown rendering including lists, headings, and links
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Stop Generation**: Halt AI responses mid-stream
- **Responsive Design**: Optimized for desktop and mobile devices
- **Model Selection**: Easy switching between available Ollama models

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Styling**: next-themes for theme management
- **Code Highlighting**: react-syntax-highlighter
- **API**: Server-Sent Events (SSE) for streaming
- **AI Backend**: Ollama local API

## 📖 Usage

1. **Select Model**: Choose from available Ollama models in the dropdown
2. **Start Chatting**: Type your message and press Enter
3. **Copy Code**: Click the copy button on code blocks
4. **Toggle Theme**: Use the theme switcher for dark/light mode
5. **Stop Response**: Click stop button to halt generation

## 📁 Project Structure

```
ai-chat-interface/
├── app/
│   ├── api/chat/route.js    # Ollama API integration
│   ├── page.js              # Main chat interface
│   └── globals.css          # Global styles
├── components/
│   └── theme-provider.tsx   # Theme management
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Node.js web application that combines AI-powered chat with real-time document editing capabilities.

## Project Architecture
- **Backend**: Express.js server with WebSocket support
- **AI Integration**: Vercel AI SDK with Google Gemini
- **Real-time Communication**: WebSockets for document collaboration, HTTP streaming for chat
- **Frontend**: Vanilla HTML/CSS/JavaScript with document editor and chat interface

## Key Features
- Streaming AI chat responses using Google Gemini via HTTP
- Real-time document editing with AI commentary via WebSocket
- WebSocket-based document collaboration
- AI-assisted document editing capabilities

## Development Guidelines
- Use modern JavaScript (ES6+) features
- Implement proper error handling for AI API calls
- Ensure WebSocket connections are robust with reconnection logic
- Follow RESTful API conventions for HTTP endpoints
- Use environment variables for sensitive configuration
- For chat, use normal http request and response streaming instead of WebSocket for simplicity
- For document editing, use WebSocket for real-time updates
- For document editing, use WebSocket for real-time updates
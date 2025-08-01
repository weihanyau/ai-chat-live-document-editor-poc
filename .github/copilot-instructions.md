# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Node.js web application that combines AI-powered chat with real-time document editing capabilities.

## Project Architecture
- **Backend**: Express.js server with WebSocket support
- **AI Integration**: Vercel AI SDK with Google Gemini
- **Real-time Communication**: WebSockets for document collaboration and AI streaming
- **Frontend**: Vanilla HTML/CSS/JavaScript with document editor and chat interface

## Key Features
- Streaming AI chat responses using Google Gemini
- Real-time document editing with AI commentary
- WebSocket-based bidirectional communication
- AI-assisted document editing capabilities

## Development Guidelines
- Use modern JavaScript (ES6+) features
- Implement proper error handling for AI API calls
- Ensure WebSocket connections are robust with reconnection logic
- Follow RESTful API conventions for HTTP endpoints
- Use environment variables for sensitive configuration

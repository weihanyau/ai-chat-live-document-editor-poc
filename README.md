# AI Chat & Document Editor POC

A real-time collaborative document editor with AI-powered chat assistance using Google Gemini and WebSocket technology.

## Features

🤖 **AI-Powered Chat**: Stream responses from Google Gemini for document assistance and general queries  
📝 **Real-time Document Editing**: Collaborative document editing with live synchronization  
💡 **AI Commentary**: Get automatic AI feedback while writing  
✨ **AI Document Editing**: Ask AI to edit your document with specific instructions  
🔄 **WebSocket Communication**: Real-time bidirectional communication for instant updates  
📱 **Responsive Design**: Clean, modern interface that works on different screen sizes  

## Technology Stack

- **Backend**: Node.js with Express.js
- **AI Integration**: Vercel AI SDK with Google Gemini
- **Real-time Communication**: WebSockets (ws library)
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Environment**: dotenv for configuration

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Google Gemini API key

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd ai-chat-and-docs-review-poc
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google Gemini API key:
   ```
   GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

### Document Editing
- Type in the document editor to start writing
- Your changes are synchronized in real-time
- AI will provide automatic commentary on your writing

### Chat with AI
- Use the chat panel to ask questions about your document
- Get writing suggestions and general assistance
- All responses are streamed in real-time

### AI Document Editing
- Select text in the document or leave it unselected for full document editing
- Enter editing instructions in the "Ask AI to edit document..." field
- Click "Edit with AI" to have the AI modify your document

### WebSocket Features
- Real-time document synchronization across multiple clients
- Live AI commentary and suggestions
- Streaming AI responses for immediate feedback

## API Endpoints

- `GET /` - Main application interface
- `GET /health` - Health check endpoint with connection count

## WebSocket Events

### Client to Server
- `chat-message` - Send chat message to AI
- `document-update` - Update document content
- `ai-document-edit-request` - Request AI to edit document

### Server to Client
- `document-sync` - Synchronize document state
- `chat-stream-start/chunk/complete` - Streaming chat responses
- `ai-commentary` - Automatic AI commentary
- `ai-edit-stream-start/chunk/complete` - Streaming AI edits

## Project Structure

```
ai-chat-and-docs-review-poc/
├── src/
│   └── server.js           # Main server file
├── public/
│   ├── index.html          # Frontend interface
│   └── app.js              # Frontend JavaScript
├── .github/
│   └── copilot-instructions.md
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (not implemented yet)

### Environment Variables

- `PORT` - Server port (default: 3000)
- `GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key
- `NODE_ENV` - Environment mode (development/production)

## Features in Detail

### Real-time Document Collaboration
The application uses WebSockets to enable real-time collaborative editing. Multiple users can edit the same document simultaneously with live synchronization.

### AI-Powered Assistance
- **Streaming Chat**: Get immediate AI responses using Google Gemini
- **Contextual Help**: AI understands your document content for relevant assistance
- **Auto Commentary**: Receive automatic writing suggestions and feedback
- **Document Editing**: Request specific edits from AI with natural language instructions

### WebSocket Architecture
- Persistent connections for real-time communication
- Automatic reconnection with exponential backoff
- Message queuing and error handling
- Connection status monitoring

## Future Enhancements

- [ ] User authentication and sessions
- [ ] Document versioning and history
- [ ] Multiple document support
- [ ] Rich text editing capabilities
- [ ] File upload and export
- [ ] Advanced AI prompt templates
- [ ] Real-time cursor positions
- [ ] Comment and suggestion system

## Troubleshooting

### Common Issues

1. **WebSocket connection fails**
   - Check if the server is running
   - Verify port availability
   - Check browser console for errors

2. **AI responses not working**
   - Verify your Google Gemini API key is correct
   - Check API quota and rate limits
   - Review server logs for errors

3. **Document not synchronizing**
   - Check WebSocket connection status
   - Refresh the page to re-establish connection
   - Check network connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for proof-of-concept purposes. Please ensure you comply with Google Gemini API terms of service.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review server logs for errors
3. Verify environment configuration
4. Check WebSocket connection status

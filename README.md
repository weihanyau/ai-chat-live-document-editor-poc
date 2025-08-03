# AI Chat & Document Editor POC

A full-stack application with web and mobile clients that provides AI-powered chat and real-time document editing capabilities using Google Gemini and Vercel AI SDK.

## Features

🤖 **AI-Powered Chat**: Stream responses from Google Gemini for document assistance and general queries  
📝 **Real-time Document Editing**: Collaborative document editing with live synchronization  
💡 **AI Commentary**: Get automatic AI feedback while writing  
✨ **AI Document Editing**: Ask AI to edit your document with specific instructions  
📱 **Cross-Platform**: Web (HTML/CSS/JS) and Mobile (React Native with Expo)  
🔄 **Hybrid Architecture**: HTTP streaming for chat, WebSocket for document sync  
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

## Mobile App Setup

1. **Navigate to mobile directory:**

   ```bash
   cd mobile/my-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start Expo development server:**

   ```bash
   npx expo start
   ```

4. **Run on device/simulator:**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## Usage

### Web Client

#### Document Editing
- Type in the document editor to start writing
- Your changes are synchronized in real-time
- AI will provide automatic commentary on your writing

#### Chat with AI
- Use the chat panel to ask questions about your document
- Get writing suggestions and general assistance
- All responses are streamed in real-time

#### AI Document Editing
- Select text in the document or leave it unselected for full document editing
- Enter editing instructions in the "Ask AI to edit document..." field
- Click "Edit with AI" to have the AI modify your document

### Mobile Client

The mobile app provides all the same functionality as the web client with native mobile UX:

#### Document Editing
- Touch-optimized text editing with real-time sync
- Connection status indicator
- Auto-saving changes via WebSocket

#### Chat Interface
- Native chat UI with streaming responses
- Conversation history
- Send button and message composition

#### AI Document Enhancement
- AI edit requests with live preview
- Streaming edit suggestions
- Full document or selection-based editing

### WebSocket Features
- Real-time document synchronization across multiple clients
- Live AI commentary and suggestions

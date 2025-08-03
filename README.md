# AI Chat & Document Editor POC

A demonstration of how to evolve from traditional HTTP-based chat streaming to a hybrid architecture that incorporates WebSocket functionalities for real-time collaboration. This full-stack application showcases AI-powered chat using HTTP streaming alongside real-time document editing via WebSockets, built with Google Gemini and Vercel AI SDK.

## Architecture Overview

This project demonstrates two distinct communication patterns for AI interaction:

### 🔄 **HTTP Streaming for Chat** 
Traditional request-response pattern with streaming capabilities:
- Client sends POST request to `/api/chat` endpoint
- Server streams AI responses chunk by chunk
- Real-time typing indicators and message updates
- Conversation history maintained on client side

### 🔗 **WebSocket for Real-time Document Collaboration**
Bidirectional real-time communication for collaborative features:
- **Document Synchronization**: Live updates across multiple clients
- **AI Commentary**: Automatic feedback triggered by document changes (2-second delay)
- **AI Document Editing**: Streaming AI edits with live preview capabilities
- **Connection Management**: Automatic reconnection and status indicators

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

4. **Configure server URLs for mobile development:**
   
   Edit `mobile/my-app/config/index.ts` and update the server URLs:
   
   ```typescript
   export const CONFIG = {
     // For Android devices/emulators - Use your machine's IP address
     SERVER_URL: 'http://YOUR_MACHINE_IP:3000',
     WS_URL: 'ws://YOUR_MACHINE_IP:3000',
     
     // For iOS simulator, you can use localhost
     // SERVER_URL: 'http://localhost:3000',
     // WS_URL: 'ws://localhost:3000',
   };
   ```

5. **Run on device/simulator:**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator
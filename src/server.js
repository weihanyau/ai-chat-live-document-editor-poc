const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { streamText } = require('ai');
const { google } = require('@ai-sdk/google');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Google Gemini
const gemini = google('models/gemini-1.5-pro', {
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store active connections and document state
const connections = new Map();
let documentContent = '';
let documentHistory = [];

// WebSocket connection handler
wss.on('connection', (ws) => {
  const connectionId = Date.now() + Math.random();
  connections.set(connectionId, ws);
  
  console.log(`Client connected: ${connectionId}`);
  
  // Send current document state to new client
  ws.send(JSON.stringify({
    type: 'document-sync',
    content: documentContent,
    timestamp: Date.now()
  }));
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'chat-message':
          await handleChatMessage(ws, data);
          break;
          
        case 'document-update':
          handleDocumentUpdate(ws, data, connectionId);
          break;
          
        case 'ai-document-edit-request':
          await handleAIDocumentEdit(ws, data);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  });
  
  ws.on('close', () => {
    connections.delete(connectionId);
    console.log(`Client disconnected: ${connectionId}`);
  });
  
  ws.on('error', (error) => {
    console.error(`WebSocket error for ${connectionId}:`, error);
    connections.delete(connectionId);
  });
});

// Handle chat messages with AI streaming
async function handleChatMessage(ws, data) {
  try {
    const { message, conversationHistory = [] } = data;
    
    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant that helps with document editing and general chat. 
        Current document content: ${documentContent || 'No document content yet.'}
        
        Provide helpful responses and when discussing document edits, be specific about suggestions.`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];
    
    // Stream the AI response
    const result = await streamText({
      model: gemini,
      messages,
      temperature: 0.7,
    });
    
    // Send streaming start indicator
    ws.send(JSON.stringify({
      type: 'chat-stream-start',
      timestamp: Date.now()
    }));
    
    let fullResponse = '';
    
    // Stream chunks to client
    for await (const chunk of result.textStream) {
      fullResponse += chunk;
      ws.send(JSON.stringify({
        type: 'chat-stream-chunk',
        chunk,
        timestamp: Date.now()
      }));
    }
    
    // Send completion indicator
    ws.send(JSON.stringify({
      type: 'chat-stream-complete',
      fullResponse,
      timestamp: Date.now()
    }));
    
  } catch (error) {
    console.error('Error in chat handling:', error);
    ws.send(JSON.stringify({
      type: 'chat-error',
      message: 'Failed to process chat message'
    }));
  }
}

// Handle document updates and broadcast to other clients
function handleDocumentUpdate(ws, data, senderId) {
  const { content, cursorPosition, selection } = data;
  
  // Update document state
  documentContent = content;
  documentHistory.push({
    content,
    timestamp: Date.now(),
    source: 'user'
  });
  
  // Broadcast to other clients (excluding sender)
  const updateMessage = JSON.stringify({
    type: 'document-update',
    content,
    cursorPosition,
    selection,
    senderId,
    timestamp: Date.now()
  });
  
  connections.forEach((client, id) => {
    if (id !== senderId && client.readyState === WebSocket.OPEN) {
      client.send(updateMessage);
    }
  });
  
  // Trigger AI commentary after a brief delay (debounced)
  clearTimeout(documentCommentaryTimeout);
  documentCommentaryTimeout = setTimeout(() => {
    triggerAICommentary(content);
  }, 2000);
}

let documentCommentaryTimeout;

// Trigger AI commentary on document changes
async function triggerAICommentary(content) {
  if (!content.trim()) return;
  
  try {
    const result = await streamText({
      model: gemini,
      messages: [
        {
          role: 'system',
          content: `You are an AI writing assistant. Provide brief, helpful commentary on the document being written. 
          Keep comments constructive and concise. Focus on content structure, clarity, or writing suggestions.`
        },
        {
          role: 'user',
          content: `Please provide brief commentary on this document content: ${content}`
        }
      ],
      temperature: 0.5,
      maxTokens: 150
    });
    
    let commentary = '';
    for await (const chunk of result.textStream) {
      commentary += chunk;
    }
    
    // Broadcast commentary to all clients
    const commentaryMessage = JSON.stringify({
      type: 'ai-commentary',
      commentary,
      timestamp: Date.now()
    });
    
    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(commentaryMessage);
      }
    });
    
  } catch (error) {
    console.error('Error generating AI commentary:', error);
  }
}

// Handle AI-assisted document editing
async function handleAIDocumentEdit(ws, data) {
  try {
    const { instruction, selectedText, documentContext } = data;
    
    const editPrompt = selectedText 
      ? `Edit this selected text: "${selectedText}" based on the instruction: "${instruction}". 
         Document context: ${documentContext || documentContent}`
      : `Edit the entire document based on this instruction: "${instruction}". 
         Current document: ${documentContent}`;
    
    const result = await streamText({
      model: gemini,
      messages: [
        {
          role: 'system',
          content: `You are an AI document editor. When given editing instructions, provide the edited content directly. 
          Be precise and maintain the document's style and format while implementing the requested changes.`
        },
        {
          role: 'user',
          content: editPrompt
        }
      ],
      temperature: 0.3,
    });
    
    // Send edit stream start
    ws.send(JSON.stringify({
      type: 'ai-edit-stream-start',
      timestamp: Date.now()
    }));
    
    let editedContent = '';
    
    // Stream the edited content
    for await (const chunk of result.textStream) {
      editedContent += chunk;
      ws.send(JSON.stringify({
        type: 'ai-edit-stream-chunk',
        chunk,
        timestamp: Date.now()
      }));
    }
    
    // Send completion with full edited content
    ws.send(JSON.stringify({
      type: 'ai-edit-stream-complete',
      editedContent,
      originalInstruction: instruction,
      timestamp: Date.now()
    }));
    
  } catch (error) {
    console.error('Error in AI document editing:', error);
    ws.send(JSON.stringify({
      type: 'ai-edit-error',
      message: 'Failed to process edit request'
    }));
  }
}

// REST API endpoints
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: Date.now(),
    connections: connections.size 
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.warn('⚠️  GOOGLE_GEMINI_API_KEY not found. Please set it in your .env file');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  connections.forEach((ws) => {
    ws.close();
  });
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

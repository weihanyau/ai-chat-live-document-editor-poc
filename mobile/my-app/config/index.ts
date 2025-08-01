// Configuration for the mobile app
export const CONFIG = {
  // Development server URLs - Use your machine's IP for Android
  SERVER_URL: 'http://192.168.100.175:3000',
  WS_URL: 'ws://192.168.100.175:3000',
  
  // For iOS simulator/web, you can use localhost
  // SERVER_URL: 'http://localhost:3000',
  // WS_URL: 'ws://localhost:3000',
  
  // Production URLs (update these when deploying)
  // SERVER_URL: 'https://your-production-server.com',
  // WS_URL: 'wss://your-production-server.com',
  
  // App settings
  AUTO_HIDE_COMMENTARY_DELAY: 10000, // 10 seconds
  SUCCESS_MESSAGE_DELAY: 3000, // 3 seconds
  MAX_CONVERSATION_HISTORY: 10, // Keep last 10 messages
};

import 'react-native-url-polyfill/auto';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface DocumentUpdateMessage extends WebSocketMessage {
  type: 'document-update';
  content: string;
  cursorPosition?: number;
  selection?: { start: number; end: number };
  senderId?: string;
  timestamp: number;
}

export interface AICommentaryMessage extends WebSocketMessage {
  type: 'ai-commentary';
  commentary: string;
  timestamp: number;
}

export interface AIEditMessage extends WebSocketMessage {
  type: 'ai-edit-stream-start' | 'ai-edit-stream-chunk' | 'ai-edit-stream-complete' | 'ai-edit-error';
  chunk?: string;
  editedContent?: string;
  originalInstruction?: string;
  message?: string;
  timestamp: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Attempting to connect to WebSocket:', this.url);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully to:', this.url);
          this.reconnectAttempts = 0;
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
          }
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data.type, data);
            const handler = this.messageHandlers.get(data.type);
            if (handler) {
              handler(data);
            } else {
              console.warn('No handler for message type:', data.type);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('❌ WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('🔥 WebSocket connection error:', error);
          console.error('Attempted URL:', this.url);
          reject(error);
        };
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = 2000 * this.reconnectAttempts;
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  on(messageType: string, handler: (data: any) => void) {
    this.messageHandlers.set(messageType, handler);
  }

  off(messageType: string) {
    this.messageHandlers.delete(messageType);
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('Sending WebSocket message:', data.type, data);
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket not connected, cannot send:', data);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

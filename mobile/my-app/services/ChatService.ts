import 'text-encoding';
import { CONFIG } from '../config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class ChatService {
  static async sendMessage(
    message: string, 
    conversationHistory: ChatMessage[] = [],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Making XMLHttpRequest to:', `${CONFIG.SERVER_URL}/api/chat`);
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${CONFIG.SERVER_URL}/api/chat`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      let lastProcessedLength = 0;
      
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.LOADING || xhr.readyState === XMLHttpRequest.DONE) {
          // Get new content since last processed
          const newContent = xhr.responseText.slice(lastProcessedLength);
          
          if (newContent) {
            console.log('New chunk received:', newContent.substring(0, 50) + '...');
            onChunk(newContent);
            lastProcessedLength = xhr.responseText.length;
          }
          
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              console.log('Stream completed successfully');
              resolve();
            } else {
              console.error('Request failed with status:', xhr.status);
              reject(new Error(`HTTP error! status: ${xhr.status}`));
            }
          }
        }
      };
      
      xhr.onerror = () => {
        console.error('Network error occurred');
        reject(new Error('Network error occurred'));
      };
      
      xhr.ontimeout = () => {
        console.error('Request timeout');
        reject(new Error('Request timeout'));
      };
      
      // Set timeout to 30 seconds
      xhr.timeout = 30000;
      
      const requestBody = JSON.stringify({
        message,
        conversationHistory: conversationHistory.slice(-10),
      });
      
      console.log('Sending request...');
      xhr.send(requestBody);
    });
  }
}

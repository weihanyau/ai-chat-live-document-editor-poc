import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import { WebSocketService } from '../services/WebSocketService';

export const useWebSocket = () => {
  const wsRef = useRef<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const ws = new WebSocketService(CONFIG.WS_URL);
    wsRef.current = ws;

    // Set up connection status handler
    ws.on('connection-status', (data) => {
      setIsConnected(data.connected);
      setConnectionStatus(data.connected ? 'connected' : 'disconnected');
    });

    // Connect to WebSocket
    ws.connect()
      .then(() => {
        setIsConnected(true);
        setConnectionStatus('connected');
      })
      .catch((error) => {
        console.error('Failed to connect to WebSocket:', error);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      });

    return () => {
      ws.disconnect();
    };
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current) {
      wsRef.current.send(data);
    }
  }, []);

  const subscribe = useCallback((messageType: string, handler: (data: any) => void) => {
    if (wsRef.current) {
      wsRef.current.on(messageType, handler);
    }
  }, []);

  const unsubscribe = useCallback((messageType: string) => {
    if (wsRef.current) {
      wsRef.current.off(messageType);
    }
  }, []);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    subscribe,
    unsubscribe,
  };
};

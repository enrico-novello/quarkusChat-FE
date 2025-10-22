import { useState, useRef, useCallback, useEffect } from 'react';

export const useWebSocket = (url, onMessage, onError) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState(null);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        setLastError(null);
        console.log('🟢 WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing message:', error);
          onError?.('Invalid message format');
        }
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        console.log('🔴 WebSocket disconnected');
        
        // Auto-reconnect dopo 3 secondi
        if (event.code !== 1000) {
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      ws.current.onerror = (error) => {
        const errorMsg = 'WebSocket connection error';
        setLastError(errorMsg);
        onError?.(errorMsg);
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      setLastError('Failed to establish connection');
      onError?.('Connection failed');
    }
  }, [url, onMessage, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    if (ws.current) {
      ws.current.close(1000, 'User disconnected');
      ws.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastError,
    connect,
    disconnect,
    sendMessage
  };
};
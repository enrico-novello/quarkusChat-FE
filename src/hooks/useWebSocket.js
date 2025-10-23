import { useState, useRef, useCallback, useEffect } from 'react';

export const useWebSocket = (url, onMessage, onError, getToken) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState(null);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

      let finalUrl = url;
      const token = getToken?.();
      
      if (token) {
        // 👇 AGGIUNGI IL TOKEN COME QUERY PARAMETER
        finalUrl = `${url}?token=${encodeURIComponent(token)}`;
        console.log('🔐 WebSocket connecting with JWT token as query parameter');
      } else {
        console.warn('⚠️ No token available for WebSocket connection');
      }

      ws.current = new WebSocket(finalUrl);
      
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
        console.log('🔴 WebSocket disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        // Auto-reconnect solo se non è un errore di autenticazione
        if (event.code !== 1008 && event.code !== 4003) { // 1008 = Policy Violation, 4003 = Custom auth error
          reconnectTimeout.current = setTimeout(() => {
            console.log('🔄 Attempting WebSocket reconnection...');
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
  }, [url, onMessage, onError, getToken]);

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
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

      const token = getToken?.();
      const finalUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
      
      console.log('🔌 Connecting to:', finalUrl);
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
        }
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        console.log('🔴 WebSocket disconnected:', event.reason);
        
        // Auto-reconnect dopo 2 secondi
        if (event.code !== 1008) { // Non riconnettere per errori di policy
          reconnectTimeout.current = setTimeout(connect, 2000);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setLastError('Connection error');
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setLastError('Connection failed');
    }
  }, [url, onMessage, getToken]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
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

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    isConnected,
    lastError,
    connect,
    disconnect,
    sendMessage
  };
};
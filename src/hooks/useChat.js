// useChat.js - Versione enterprise-ready
import { useState, useCallback, useRef, useMemo } from 'react';

export const useChat = (token) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [roomId, setRoomId] = useState(1);
  
  const typingTimeouts = useRef(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  const user = {
    username: 'authenticated-user',
    userId: 'user-from-token', 
    email: 'user@example.com',
    isAuthenticated: !!token
  };

  const addMessage = useCallback((message) => {
    const messageWithId = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: message.timestamp || new Date().toISOString()
    };
    
    setMessages(prev => {
      const newMessages = [...prev, messageWithId];
      return newMessages.slice(-1000);
    });
  }, []);

  const handleWebSocketMessage = useCallback((data) => {
    console.log('📨 WebSocket message received:', data);
    
    try {
      switch (data.type) {
        case 'message':
          addMessage({
            type: 'user',
            sender: data.data.username || data.data.user?.username || 'Unknown',
            content: data.data.content,
            timestamp: data.data.timestamp || data.data.sentAt,
            user: data.data.user || { username: data.data.username }
          });
          break;

        case 'system':
          addMessage({
            type: 'system',
            sender: 'System',
            content: data.data.message,
            timestamp: data.data.timestamp || new Date().toISOString()
          });
          break;

        case 'typing':
          handleTypingNotification(data.data);
          break;

        case 'error':
          addMessage({
            type: 'error',
            sender: 'Error',
            content: data.data.message,
            timestamp: new Date().toISOString()
          });
          
          // 👇 SE È UN ERRORE DI AUTENTICAZIONE, NON RICONNETTERE
          if (data.data.message.includes('Authentication') || data.data.message.includes('auth')) {
            console.error('🔒 Authentication error - stopping reconnection attempts');
            reconnectAttempts.current = maxReconnectAttempts;
          }
          break;

        default:
          console.warn('Unknown message type:', data.type, data);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      addMessage({
        type: 'error',
        sender: 'System',
        content: 'Error processing message',
        timestamp: new Date().toISOString()
      });
    }
  }, [addMessage]);

  const handleTypingNotification = useCallback((typingData) => {
    const { username, isTyping } = typingData;
    
    if (!username) {
      console.warn('Typing notification missing username');
      return;
    }

    if (isTyping) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(username);
        return newSet;
      });
      
      // Auto-remove after 3 seconds
      if (typingTimeouts.current.has(username)) {
        clearTimeout(typingTimeouts.current.get(username));
      }
      
      const timeout = setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
        typingTimeouts.current.delete(username);
      }, 3000);
      
      typingTimeouts.current.set(username, timeout);
    } else {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
      
      if (typingTimeouts.current.has(username)) {
        clearTimeout(typingTimeouts.current.get(username));
        typingTimeouts.current.delete(username);
      }
    }
  }, []);

  const sendChatMessage = useCallback((content, websocket) => {
    if (!content || !content.trim()) {
      console.warn('⚠️ Attempted to send empty message');
      return false;
    }

    if (!user.isAuthenticated) {
      console.error('❌ Cannot send message: User not authenticated');
      addMessage({
        type: 'error',
        sender: 'System',
        content: 'You must be logged in to send messages',
        timestamp: new Date().toISOString()
      });
      return false;
    }

    if (!websocket || !websocket.isConnected?.()) {
      console.error('❌ WebSocket not connected');
      addMessage({
        type: 'error',
        sender: 'System',
        content: 'Connection lost. Please refresh the page.',
        timestamp: new Date().toISOString()
      });
      return false;
    }

    console.log('💬 Sending chat message:', content.substring(0, 50) + '...');
    
    try {
      const success = websocket.sendMessage({
        type: 'message',
        content: content.trim(),
        timestamp: new Date().toISOString()
      });

      if (success) {
        // Aggiungi il messaggio localmente per feedback immediato
        addMessage({
          type: 'user',
          sender: user.username,
          content: content.trim(),
          timestamp: new Date().toISOString(),
          user: { username: user.username },
          isLocal: true
        });
      }

      return success;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [user, addMessage]);

  const sendTypingIndicator = useCallback((isTyping, websocket) => {
    if (!user.isAuthenticated) {
      return false;
    }

    if (!websocket || !websocket.isConnected?.()) {
      return false;
    }

    console.log('⌨️ Sending typing indicator:', isTyping);
    
    try {
      return websocket.sendMessage({
        type: 'typing',
        isTyping: isTyping,
        username: user.username
      });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      return false;
    }
  }, [user]);

  const updateRoomId = useCallback((newRoomId) => {
    if (newRoomId < 1) {
      console.warn('Invalid room ID:', newRoomId);
      return;
    }
    
    console.log(`🔄 Changing room from ${roomId} to ${newRoomId}`);
    setRoomId(newRoomId);
    setMessages([]);
    setTypingUsers(new Set());
    
    // Cleanup all timeouts
    typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
    typingTimeouts.current.clear();
  }, [roomId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

   const cleanup = useCallback(() => {
    typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
    typingTimeouts.current.clear();
    reconnectAttempts.current = 0;
  }, []);

  return {
    messages,
    typingUsers: Array.from(typingUsers),
    user,
    roomId,
    handleWebSocketMessage,
    sendChatMessage,
    sendTypingIndicator,
    updateRoomId,
    clearMessages,
    cleanup,
    isAuthenticated: user.isAuthenticated
  };
};

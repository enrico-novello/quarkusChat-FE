import { useState, useCallback, useRef } from 'react';

export const useChat = (token) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [roomId, setRoomId] = useState(1);
  
  const typingTimeouts = useRef({});

  const user = {
    username: 'user-' + Math.random().toString(36).substr(2, 5),
    userId: 'user-id-' + Date.now(),
    isAuthenticated: !!token
  };

  const addMessage = useCallback((message) => {
    const messageWithId = {
      ...message,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      timestamp: message.timestamp || new Date().toISOString()
    };
    
    setMessages(prev => [...prev, messageWithId].slice(-100)); // Keep last 100 messages
  }, []);

  const handleWebSocketMessage = useCallback((data) => {
    console.log('📨 WebSocket message:', data);
    
    try {
      switch (data.type) {
        case 'message':
          addMessage({
            type: 'user',
            sender: data.data.user?.username || 'Unknown',
            content: data.data.content,
            timestamp: data.data.sentAt
          });
          break;

        case 'system':
          addMessage({
            type: 'system',
            sender: 'System',
            content: data.data.message,
            timestamp: data.data.timestamp
          });
          break;

        case 'typing':
          const { username, isTyping } = data.data;
          setTypingUsers(prev => {
            if (isTyping) {
              return [...new Set([...prev, username])];
            } else {
              return prev.filter(user => user !== username);
            }
          });
          
          // Auto-remove typing indicator after 3 seconds
          if (isTyping) {
            clearTimeout(typingTimeouts.current[username]);
            typingTimeouts.current[username] = setTimeout(() => {
              setTypingUsers(prev => prev.filter(user => user !== username));
            }, 3000);
          }
          break;

        case 'error':
          addMessage({
            type: 'error',
            sender: 'Error',
            content: data.data.message
          });
          break;

        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }, [addMessage]);

  const sendChatMessage = useCallback((content, websocket) => {
    if (!content?.trim()) return false;
    if (!websocket?.isConnected?.()) return false;

    return websocket.sendMessage({
      type: 'message',
      content: content.trim()
    });
  }, []);

  const sendTypingIndicator = useCallback((isTyping, websocket) => {
    if (!websocket?.isConnected?.()) return false;

    return websocket.sendMessage({
      type: 'typing',
      isTyping: isTyping
    });
  }, []);

  const updateRoomId = useCallback((newRoomId) => {
    if (newRoomId < 1) return;
    setRoomId(newRoomId);
    setMessages([]);
    setTypingUsers([]);
  }, []);

  return {
    messages,
    typingUsers,
    user,
    roomId,
    handleWebSocketMessage,
    sendChatMessage,
    sendTypingIndicator,
    updateRoomId,
    isAuthenticated: !!token
  };
};
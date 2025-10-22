import { useState, useCallback, useRef } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [user, setUser] = useState({ username: 'testuser', userId: 1 });
  const [roomId, setRoomId] = useState(1);
  
  const typingTimeouts = useRef(new Map());

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, { 
      ...message, 
      id: Date.now() + Math.random() 
    }]);
  }, []);

  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'message':
        addMessage({
          type: 'user',
          sender: data.data.user?.username || 'Unknown',
          content: data.data.content,
          timestamp: data.data.sentAt,
          user: data.data.user
        });
        break;

      case 'system':
        addMessage({
          type: 'system',
          sender: 'System',
          content: data.data.message,
          timestamp: data.timestamp
        });
        break;

      case 'typing':
        if (data.data.isTyping) {
          setTypingUsers(prev => new Set([...prev, data.data.username]));
          
          // Auto-rimuovi dopo 3 secondi
          if (typingTimeouts.current.has(data.data.username)) {
            clearTimeout(typingTimeouts.current.get(data.data.username));
          }
          
          const timeout = setTimeout(() => {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.data.username);
              return newSet;
            });
          }, 3000);
          
          typingTimeouts.current.set(data.data.username, timeout);
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.data.username);
            return newSet;
          });
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
  }, [addMessage]);

  const sendChatMessage = useCallback((content, websocket) => {
    if (!content.trim()) return false;

    const success = websocket.sendMessage({
      type: 'message',
      userId: user.userId,
      username: user.username,
      content: content.trim()
    });

    return success;
  }, [user]);

  const sendTypingIndicator = useCallback((isTyping, websocket) => {
    return websocket.sendMessage({
      type: 'typing',
      username: user.username,
      isTyping: isTyping
    });
  }, [user]);

  const updateUser = useCallback((newUser) => {
    setUser(prev => ({ ...prev, ...newUser }));
  }, []);

  const updateRoomId = useCallback((newRoomId) => {
    setRoomId(newRoomId);
  }, []);

  return {
    messages,
    typingUsers: Array.from(typingUsers),
    user,
    roomId,
    handleWebSocketMessage,
    sendChatMessage,
    sendTypingIndicator,
    updateUser,
    updateRoomId
  };
};
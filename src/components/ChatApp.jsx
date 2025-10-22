// components/ChatApp.jsx
import React, { useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChat } from '../hooks/useChat';
import ControlPanel from './ControlPanel';
import ConnectionStatus from './ConnectionStatus';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import '../styles/ChatApp.css';

const ChatApp = () => {
  const {
    messages,
    typingUsers,
    user,
    roomId,
    handleWebSocketMessage,
    sendChatMessage,
    sendTypingIndicator,
    updateUser,
    updateRoomId
  } = useChat();

  const handleWebSocketError = useCallback((error) => {
    console.error('WebSocket error:', error);
  }, []);

  const websocketUrl = `ws://localhost:8080/ws/chat/${roomId}`;
  
  const {
    isConnected,
    lastError,
    connect,
    disconnect,
    sendMessage
  } = useWebSocket(websocketUrl, handleWebSocketMessage, handleWebSocketError);

  const handleConnect = useCallback(() => {
    if (!user.username || !user.userId) {
      alert('Please enter username and user ID');
      return;
    }
    connect();
  }, [connect, user]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const handleSendMessage = useCallback((content) => {
    return sendChatMessage(content, { sendMessage });
  }, [sendChatMessage, sendMessage]);

  const handleTypingStart = useCallback(() => {
    sendTypingIndicator(true, { sendMessage });
  }, [sendTypingIndicator, sendMessage]);

  const handleTypingStop = useCallback(() => {
    sendTypingIndicator(false, { sendMessage });
  }, [sendTypingIndicator, sendMessage]);

  return (
    <div className="container">
      <h1>⚡ PUNK CHAT ⚡</h1>
      
      <ControlPanel
        user={user}
        roomId={roomId}
        isConnected={isConnected}
        onUserUpdate={updateUser}
        onRoomUpdate={updateRoomId}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      
      <ConnectionStatus 
        isConnected={isConnected} 
        lastError={lastError} 
      />
      
      <MessageList 
        messages={messages} 
        typingUsers={typingUsers} 
      />
      
      <ChatInput
        isConnected={isConnected}
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
    </div>
  );
};

export default ChatApp;
import React, { useCallback, useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChat } from '../hooks/useChat';
import ControlPanel from './ControlPanel';
import ConnectionStatus from './ConnectionStatus';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import '../styles/ChatApp.css';

const ChatApp = () => {
  const [token, setToken] = useState(null);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  
  // 👇 DEBUG ESTESO PER IL TOKEN
  useEffect(() => {
    console.log('🔍 ChatApp mounted - Checking for token...');
    console.log('📍 Current URL:', window.location.href);
    console.log('🔍 URL Search:', window.location.search);
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    console.log('🔑 Extracted token from URL:', urlToken ? 'YES' : 'NO');
    
    if (urlToken) {
      console.log('✅ Token received:', urlToken.substring(0, 20) + '...');
      setToken(urlToken);
      
      // Rimuovi il token dall'URL per sicurezza
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('🔄 URL cleaned, token stored in state');
    } else {
      console.log('❌ No token found in URL');
    }
  }, []);

  // 👇 DEBUG QUANDO TOKEN CAMBIA
  useEffect(() => {
    console.log('🔄 Token state changed:', token ? 'HAS TOKEN' : 'NO TOKEN');
  }, [token]);

  const {
    messages,
    typingUsers,
    user,
    roomId,
    handleWebSocketMessage,
    sendChatMessage,
    sendTypingIndicator,
    updateRoomId,
    isAuthenticated
  } = useChat(token);

  const handleWebSocketError = useCallback((error) => {
    console.error('WebSocket error:', error);
  }, []);

  const getToken = useCallback(() => {
    console.log('🔑 getToken called, returning:', token ? token.substring(0, 10) + '...' : 'null');
    return token;
  }, [token]);

  const websocketUrl = `ws://localhost:8080/ws/chat/${roomId}`;
  
  const {
    isConnected,
    lastError,
    connect,
    disconnect,
    sendMessage
  } = useWebSocket(websocketUrl, handleWebSocketMessage, handleWebSocketError, getToken);

  // 👇 DEBUG CONNESSIONE
  useEffect(() => {
    console.log('🔌 Connection state - Token:', !!token, 'Attempted:', connectionAttempted, 'Connected:', isConnected);
    
    if (token && !connectionAttempted) {
      console.log('🚀 Attempting WebSocket connection with token...');
      setConnectionAttempted(true);
      connect();
    }
  }, [token, connect, connectionAttempted, isConnected]);

  const handleDisconnect = useCallback(() => {
    console.log('🔌 Manual disconnect');
    disconnect();
    setConnectionAttempted(false);
  }, [disconnect]);

  const handleSendMessage = useCallback((content) => {
    console.log('💬 Sending message:', content.substring(0, 30) + '...');
    return sendChatMessage(content, { sendMessage, isConnected: () => isConnected });
  }, [sendChatMessage, sendMessage, isConnected]);

  const handleTypingStart = useCallback(() => {
    console.log('⌨️ Starting typing indicator');
    sendTypingIndicator(true, { sendMessage, isConnected: () => isConnected });
  }, [sendTypingIndicator, sendMessage, isConnected]);

  const handleTypingStop = useCallback(() => {
    console.log('🛑 Stopping typing indicator');
    sendTypingIndicator(false, { sendMessage, isConnected: () => isConnected });
  }, [sendTypingIndicator, sendMessage, isConnected]);

  // 👇 SE NON C'È TOKEN, MOSTRA MESSAGGIO CON PULSANTE CORRETTO
  if (!token) {
    return (
      <div className="container">
        <div className="auth-required">
          <h2>🔐 Authentication Required</h2>
          <p>No authentication token found.</p>
          <p>Please log in to access the chat.</p>
          <button 
            onClick={() => {
              console.log('🔐 Redirecting to backend login...');
              window.location.href = 'http://localhost:8080/auth/login';
            }}
            className="btn-primary"
          >
            Login with Keycloak
          </button>
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p>Debug Info:</p>
            <p>Current URL: {window.location.href}</p>
            <p>Token in state: {token ? 'YES' : 'NO'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="chat-header">
        <h1>⚡ PUNK CHAT ⚡</h1>
        <div className="user-info">
          <span>Authenticated! Token: {token.substring(0, 15)}...</span>
          <span>WebSocket: {isConnected ? '🟢 CONNECTED' : '🔴 DISCONNECTED'}</span>
        </div>
      </header>
      
      <ControlPanel
        user={user}
        roomId={roomId}
        isConnected={isConnected}
        onRoomUpdate={updateRoomId}
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
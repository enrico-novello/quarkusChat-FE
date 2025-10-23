import React, { useCallback, useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChat } from '../hooks/useChat';
import ControlPanel from './ControlPanel';
import ConnectionStatus from './ConnectionStatus';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import LoadingSpinner from './LoadingSpinner';
import '../styles/ChatApp.css';

const ChatApp = () => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estrai il token dall'URL
  useEffect(() => {
    console.log('🔍 ChatApp mounted - Checking for token...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      console.log('✅ Token received from URL');
      setToken(urlToken);
      // Rimuovi il token dall'URL per sicurezza
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      console.log('❌ No token found in URL');
    }
    
    setIsLoading(false);
  }, []);

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

  const getToken = useCallback(() => token, [token]);

  const websocketUrl = `ws://localhost:8080/ws/chat/${roomId}`;
  
  const {
    isConnected,
    lastError,
    connect,
    disconnect,
    sendMessage
  } = useWebSocket(websocketUrl, handleWebSocketMessage, handleWebSocketError, getToken);

  // Gestione connessione WebSocket
  useEffect(() => {
    if (token && !isLoading) {
      console.log('🚀 Attempting WebSocket connection...');
      connect();
    }
  }, [token, isLoading, connect]);

  const handleDisconnect = useCallback(() => {
    console.log('🔌 Manual disconnect');
    disconnect();
  }, [disconnect]);

  const handleSendMessage = useCallback((content) => {
    return sendChatMessage(content, { sendMessage, isConnected: () => isConnected });
  }, [sendChatMessage, sendMessage, isConnected]);

  const handleTypingStart = useCallback(() => {
    sendTypingIndicator(true, { sendMessage, isConnected: () => isConnected });
  }, [sendTypingIndicator, sendMessage, isConnected]);

  const handleTypingStop = useCallback(() => {
    sendTypingIndicator(false, { sendMessage, isConnected: () => isConnected });
  }, [sendTypingIndicator, sendMessage, isConnected]);

  // Mostra loading durante l'inizializzazione
  if (isLoading) {
    return <LoadingSpinner message="Initializing chat..." />;
  }

  // Se non c'è token, mostra schermata di login
  if (!token) {
    return (
      <div className="container">
        <div className="auth-required">
          <h2>🔐 Authentication Required</h2>
          <p>Please log in to access the chat.</p>
          <button 
            onClick={() => {
              window.location.href = 'http://localhost:8080/auth/login';
            }}
            className="btn-primary"
          >
            Login with Keycloak
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="chat-header">
        <h1>⚡ PUNK CHAT ⚡</h1>
        <ConnectionStatus 
          isConnected={isConnected} 
          lastError={lastError} 
        />
      </header>
      
      <ControlPanel
        user={user}
        roomId={roomId}
        isConnected={isConnected}
        onRoomUpdate={updateRoomId}
        onDisconnect={handleDisconnect}
        token={token}
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
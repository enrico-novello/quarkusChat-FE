import React, { useState, useCallback, useEffect, useRef } from 'react';

const ChatInput = ({ 
  isConnected, 
  onSendMessage, 
  onTypingStart, 
  onTypingStop 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSend = useCallback(() => {
    if (message.trim() && onSendMessage(message)) {
      setMessage('');
      handleStopTyping();
    }
  }, [message, onSendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

  const handleStartTyping = useCallback(() => {
    if (!isTyping && isConnected) {
      setIsTyping(true);
      onTypingStart?.();
    }
  }, [isTyping, isConnected, onTypingStart]);

  const handleStopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [isTyping, onTypingStop]);

  useEffect(() => {
    if (message.trim() && !isTyping) {
      handleStartTyping();
    } else if (!message.trim() && isTyping) {
      handleStopTyping();
    }

    // Auto-stop typing dopo 3 secondi di inattività
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        handleStopTyping();
      }, 3000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, handleStartTyping, handleStopTyping]);

  return (
    <>
      <div className="chat-input">
        <input
          type="text"
          id="messageInput"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
        />
        <button 
          id="sendBtn" 
          onClick={handleSend}
          disabled={!isConnected || !message.trim()}
        >
          SEND
        </button>
      </div>
      
      <div className="typing-buttons">
        <button 
          onClick={handleStartTyping}
          id="typingBtn" 
          disabled={!isConnected || isTyping}
        >
          START TYPING
        </button>
        <button 
          onClick={handleStopTyping}
          id="stopTypingBtn" 
          disabled={!isConnected || !isTyping}
        >
          STOP TYPING
        </button>
      </div>
    </>
  );
};

export default ChatInput;
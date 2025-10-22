import React, { useEffect, useRef } from 'react';
import Message from './Message';

const MessageList = ({ messages, typingUsers }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  return (
    <div id="messages">
      {messages.map(message => (
        <Message key={message.id} message={message} />
      ))}
      
      {typingUsers.map(username => (
        <div key={username} className="typing-indicator">
          ✍️ {username} is typing...
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
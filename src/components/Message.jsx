import React from 'react';

const Message = ({ message }) => {
  const getMessageClass = () => {
    switch (message.type) {
      case 'system': return 'message system';
      case 'error': return 'message error';
      case 'user': return 'message user-message';
      default: return 'message';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString();
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={getMessageClass()}>
      {message.type === 'user' ? (
        <>
          <span className="username">{message.sender}:</span> 
          {message.content}
          <span className="timestamp">{formatTime(message.timestamp)}</span>
        </>
      ) : (
        <>
          <span className={message.type}>{message.sender}: {message.content}</span>
          <span className="timestamp">{formatTime(message.timestamp)}</span>
        </>
      )}
    </div>
  );
};

export default Message;
import React from 'react';

const ConnectionStatus = ({ isConnected, lastError }) => {
  return (
    <div className="connection-status">
      <span 
        id="statusText" 
        className={isConnected ? 'status-connected' : 'status-disconnected'}
      >
        {isConnected ? '🟢 CONNECTED' : '🔴 DISCONNECTED'}
        {lastError && ` - ${lastError}`}
      </span>
    </div>
  );
};

export default ConnectionStatus;
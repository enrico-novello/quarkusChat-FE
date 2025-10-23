import React from 'react';

const ControlPanel = ({ 
  user, 
  roomId, 
  isConnected, 
  onRoomUpdate, 
  onDisconnect,
  token 
}) => {
  const handleLogout = () => {
    // Logout semplice - rimuovi token e ricarica
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleReconnect = () => {
    window.location.reload();
  };

  return (
    <div className="control-panel">
      <div className="user-section">
        <span><strong>User:</strong> {user?.username || 'Loading...'}</span>
        <span><strong>Token:</strong> {token ? `${token.substring(0, 10)}...` : 'None'}</span>
      </div>
      
      <div className="room-section">
        <label>
          Room ID:
          <input
            type="number"
            value={roomId}
            onChange={(e) => onRoomUpdate(parseInt(e.target.value) || 1)}
            min="1"
            disabled={isConnected}
          />
        </label>
      </div>
      
      <div className="actions-section">
        {isConnected ? (
          <button onClick={onDisconnect} className="btn-disconnect">
            Disconnect
          </button>
        ) : (
          <button onClick={handleReconnect} className="btn-reconnect">
            Reconnect
          </button>
        )}
        
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
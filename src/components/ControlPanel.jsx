// components/ControlPanel.jsx
import React from 'react';
import { useAuth } from 'react-oidc-context';

const ControlPanel = ({ 
  user, 
  roomId, 
  isConnected, 
  onRoomUpdate, 
  onDisconnect 
}) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="control-panel">
      <div className="user-section">
        <span><strong>User:</strong> {user.username} (ID: {user.userId})</span>
      </div>
      
      <div className="room-section">
        <label>
          Room ID:
          <input
            type="number"
            value={roomId}
            onChange={(e) => onRoomUpdate(parseInt(e.target.value))}
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
          <span className="connected-status">Connected automatically</span>
        )}
        
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
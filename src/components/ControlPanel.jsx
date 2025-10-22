import React from 'react';

const ControlPanel = ({ 
  user, 
  roomId, 
  isConnected, 
  onUserUpdate, 
  onRoomUpdate, 
  onConnect, 
  onDisconnect 
}) => {
  const handleUserChange = (field, value) => {
    onUserUpdate({ [field]: value });
  };

  const handleRoomChange = (value) => {
    onRoomUpdate(Number(value));
  };

  return (
    <div className="control-panel">
      <div className="input-group">
        <label htmlFor="usernameInput">USERNAME</label>
        <input
          type="text"
          id="usernameInput"
          placeholder="Enter username"
          value={user.username}
          onChange={(e) => handleUserChange('username', e.target.value)}
          disabled={isConnected}
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="userIdInput">USER ID</label>
        <input
          type="number"
          id="userIdInput"
          placeholder="User ID"
          value={user.userId}
          onChange={(e) => handleUserChange('userId', Number(e.target.value))}
          disabled={isConnected}
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="roomIdInput">ROOM ID</label>
        <input
          type="number"
          id="roomIdInput"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => handleRoomChange(e.target.value)}
          disabled={isConnected}
        />
      </div>
      
      <div className="button-group">
        <button 
          id="connectBtn" 
          onClick={onConnect}
          disabled={isConnected || !user.username || !user.userId}
        >
          CONNECT
        </button>
        <button 
          id="disconnectBtn" 
          onClick={onDisconnect}
          disabled={!isConnected}
        >
          DISCONNECT
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
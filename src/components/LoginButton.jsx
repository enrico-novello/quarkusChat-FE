import React from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginButton = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="user-info">
        <span>Welcome, {user?.profile?.preferred_username}!</span>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={login} className="login-btn">
      Login with Keycloak
    </button>
  );
};

export default LoginButton;
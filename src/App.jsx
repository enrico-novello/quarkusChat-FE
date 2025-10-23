// App.jsx - Versione corretta
import React from 'react';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Callback from './components/Callback';
import ChatApp from './components/ChatApp';
import './App.css';

const oidcConfig = {
  authority: 'http://localhost:8081/realms/quarkus-chat',
  client_id: 'quarkus-chat-app',
  redirect_uri: 'http://localhost:5173/callback',
  response_type: 'code',
  scope: 'openid profile email',
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

// 👇 COMPONENTE PER GESTIRE L'AUTH
const AuthChecker = ({ children }) => {
  const auth = useAuth();
  
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }
  
  return children;
};

// 👇 COMPONENTE PRINCIPALE CON ROUTING
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* 👇 ROTTA PRINCIPALE - redirect a /chat */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        
        {/* 👇 ROTTA LOGIN */}
        <Route path="/login" element={<Login />} />
        
        {/* 👇 ROTTA CALLBACK OIDC */}
        <Route path="/callback" element={<Callback />} />
        
        {/* 👇 ROTTA CHAT - SEMPRE ACCESSIBILE, GESTISCE AUTH INTERNAMENTE */}
        <Route path="/chat" element={<ChatApp />} />
        
        {/* 👇 FALLBACK */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider {...oidcConfig}>
      <AuthChecker>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthChecker>
    </AuthProvider>
  );
}

export default App;
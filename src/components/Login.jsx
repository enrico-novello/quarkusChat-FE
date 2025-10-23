import React from 'react';

const Login = () => {
  const handleLogin = () => {
    console.log('🔐 Redirecting to backend login...');
    // 👇 CORREGGI L'URL - usa il path corretto per OIDC
    window.location.href = 'http://localhost:8080/auth/oidc/login';
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      padding: '20px'
    }}>
      <h1>⚡ PUNK CHAT ⚡</h1>
      <p>Welcome to the secure chat application</p>
      
      <button 
        onClick={handleLogin}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          margin: '20px 0'
        }}
      >
        Login with Keycloak
      </button>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h3>Debug Info:</h3>
        <p>Using OIDC authentication endpoint</p>
        <p>Endpoint: <code>/auth/oidc/login</code></p>
      </div>
    </div>
  );
};

export default Login;
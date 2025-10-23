import React from 'react';

const Login = () => {
  const handleLogin = async () => {
    try {
      console.log('🔐 Redirecting to backend login...');
      // 👇 USA SEMPRE IL BACKEND PER IL LOGIN
      window.location.href = 'http://localhost:8080/auth/login';
    } catch (error) {
      console.error('❌ Login failed:', error);
      alert('Login failed: ' + error.message);
    }
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
        <p>Using backend authentication</p>
        <button 
          onClick={() => {
            // Test diretto
            window.location.href = 'http://localhost:8080/auth/login';
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          Test Direct Backend Login
        </button>
      </div>
    </div>
  );
};

export default Login;
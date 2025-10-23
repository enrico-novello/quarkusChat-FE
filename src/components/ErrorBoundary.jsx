// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In produzione, invia l'errore a un servizio di logging
    if (process.env.NODE_ENV === 'production') {
      // this.logErrorToService(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h2 style={{ 
              color: '#dc3545', 
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              ⚠️ Something went wrong
            </h2>
            
            <p style={{ 
              color: '#6c757d', 
              marginBottom: '30px',
              fontSize: '16px'
            }}>
              We encountered an unexpected error. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details style={{ 
                textAlign: 'left', 
                marginBottom: '20px',
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '5px',
                fontSize: '14px'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Error Details (Development)
                </summary>
                <div style={{ marginTop: '10px' }}>
                  <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  <br /><br />
                  <strong>Stack:</strong>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap',
                    fontSize: '12px',
                    overflow: 'auto'
                  }}>
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button 
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Reload Page
              </button>
              
              <button 
                onClick={this.handleGoHome}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
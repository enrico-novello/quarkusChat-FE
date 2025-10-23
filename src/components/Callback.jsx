import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

const Callback = () => {
  const auth = useAuth();
  
  useEffect(() => {
    console.log('🔄 Processing OAuth callback...');
    console.log('📍 Current URL:', window.location.href);
    auth.clearStaleState();
    
    auth.signinCallback()
      .then((user) => {
        console.log('✅ Login successful:', user);
        window.location.href = '/chat';
      })
      .catch((error) => {
        console.error('❌ Login callback error:', error);
        console.error('🔍 Error details:', {
          message: error.message,
          stack: error.stack,
          url: window.location.href
        });
        window.location.href = '/login';
      });
  }, [auth]);

  return <div>Processing login...</div>;
};

export default Callback;
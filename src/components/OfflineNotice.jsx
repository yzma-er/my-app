import React, { useState, useEffect } from 'react';

export default function OfflineNotice() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#ff9800',
      color: 'white',
      padding: '10px',
      textAlign: 'center',
      zIndex: 9999,
      fontWeight: 'bold'
    }}>
      ⚠️ You are offline. Some features may not work.
    </div>
  );
}

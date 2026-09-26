import { useState, useEffect } from 'react';
import api from '../services/api';

export type NetworkStatus = 'ONLINE' | 'OFFLINE' | 'BACKEND_UNAVAILABLE';

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>(navigator.onLine ? 'ONLINE' : 'OFFLINE');

  useEffect(() => {
    const handleOnline = () => {
      // Browser says online, but verify backend
      checkBackend();
    };

    const handleOffline = () => {
      setStatus('OFFLINE');
    };

    const checkBackend = async () => {
      try {
        // Just a simple ping to any reliable backend endpoint or a dedicated status endpoint
        await api.get('/data-sources/status', { timeout: 50000 });
        setStatus('ONLINE');
      } catch (err: any) {
        if (!navigator.onLine) {
          setStatus('OFFLINE');
        } else {
          setStatus('BACKEND_UNAVAILABLE');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (navigator.onLine) {
      checkBackend();
    }

    // Polling every 30s if we suspect backend is down but browser is online
    const interval = setInterval(() => {
       if (navigator.onLine) {
          checkBackend();
       }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return status;
};

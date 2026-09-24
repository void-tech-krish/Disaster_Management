import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const ConnectionStatus: React.FC = () => {
  const status = useNetworkStatus();

  if (status === 'ONLINE') return null; // Unintrusive when healthy

  return (
    <div className={`w-full p-2 text-center text-sm font-bold shadow-md z-50 ${status === 'OFFLINE' ? 'bg-danger text-white' : 'bg-warning text-darkslate'}`}>
      {status === 'OFFLINE' && '🔴 OFFLINE MODE: You are viewing cached emergency information.'}
      {status === 'BACKEND_UNAVAILABLE' && '🟡 BACKEND UNAVAILABLE: Internet connected, but live disaster intelligence is unreachable.'}
    </div>
  );
};

export default ConnectionStatus;

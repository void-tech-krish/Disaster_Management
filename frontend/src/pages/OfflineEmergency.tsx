import React from 'react';
import OfflineChecklist from '../components/Emergency/OfflineChecklist';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Link } from 'react-router-dom';

const OfflineEmergency: React.FC = () => {
  const status = useNetworkStatus();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Emergency Hub</h1>
        {status === 'OFFLINE' && (
          <p className="text-danger font-bold text-sm bg-danger/20 p-2 rounded inline-block mt-2">
            OFFLINE MODE: You are viewing cached emergency information. Live risk and official warnings may be unavailable.
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Offline Guides */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-warning">Survival Guides</h2>
          <div className="space-y-4">
            <details className="bg-darkslate p-4 rounded-xl border border-gray-700 cursor-pointer group">
              <summary className="font-bold outline-none group-hover:text-warning transition-colors">Flood Safety</summary>
              <div className="mt-4 text-sm text-gray-300 space-y-2">
                <p><strong>Before:</strong> Identify safe routes to higher ground. Elevate appliances.</p>
                <p><strong>During:</strong> Move to higher ground immediately. Do not walk or drive through floodwaters (Turn Around, Don't Drown).</p>
                <p><strong>After:</strong> Avoid floodwaters which may be contaminated. Check structural damage before entering buildings.</p>
              </div>
            </details>
            <details className="bg-darkslate p-4 rounded-xl border border-gray-700 cursor-pointer group">
              <summary className="font-bold outline-none group-hover:text-warning transition-colors">Earthquake Safety</summary>
              <div className="mt-4 text-sm text-gray-300 space-y-2">
                <p><strong>During:</strong> Drop, Cover, and Hold On. Stay away from windows and heavy furniture.</p>
                <p><strong>If outdoors:</strong> Move to an open area away from buildings, trees, and power lines.</p>
                <p><strong>After:</strong> Expect aftershocks. Check for gas leaks and fire hazards.</p>
              </div>
            </details>
            <details className="bg-darkslate p-4 rounded-xl border border-gray-700 cursor-pointer group">
              <summary className="font-bold outline-none group-hover:text-warning transition-colors">Cyclone / Hurricane</summary>
              <div className="mt-4 text-sm text-gray-300 space-y-2">
                <p><strong>Before:</strong> Secure windows. Clear loose objects from outside. Store drinking water.</p>
                <p><strong>During:</strong> Stay indoors away from windows. Do not go out during the eye of the storm.</p>
                <p><strong>After:</strong> Watch out for fallen power lines and weakened structures.</p>
              </div>
            </details>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-warning">Emergency Contacts</h2>
            <div className="bg-darkslate p-4 rounded-xl border border-gray-700 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="font-bold">National Emergency Number</span>
                <a href="tel:112" className="text-blue-400 bg-blue-400/10 px-3 py-1 rounded font-mono">112</a>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="font-bold">Ambulance</span>
                <a href="tel:102" className="text-blue-400 bg-blue-400/10 px-3 py-1 rounded font-mono">102</a>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="font-bold">Fire</span>
                <a href="tel:101" className="text-blue-400 bg-blue-400/10 px-3 py-1 rounded font-mono">101</a>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">Police</span>
                <a href="tel:100" className="text-blue-400 bg-blue-400/10 px-3 py-1 rounded font-mono">100</a>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Checklist */}
        <div>
          <OfflineChecklist />
          
          <div className="mt-8">
             <Link to="/dashboard" className="block text-center w-full bg-charcoal hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-600 transition-colors">
               Return to Dashboard
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineEmergency;

import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Emergency: React.FC = () => {
  const status = useNetworkStatus();
  const [warnings, setWarnings] = useState<any[]>([]);
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'OFFLINE') {
      setLoading(false);
      return;
    }
    
    Promise.all([
      api.get('/alerts').catch(() => ({ data: { data: { alerts: [] } } })),
      api.get('/evacuation/public').catch(() => ({ data: { data: [] } }))
    ]).then(([alertsRes, evacRes]) => {
      const official = alertsRes.data.data.alerts.filter((a: any) => a.source === 'OFFICIAL WARNING' && a.severity === 'CRITICAL');
      setWarnings(official);
      setAdvisories(evacRes.data.data || []);
    }).finally(() => setLoading(false));
  }, [status]);

  if (status === 'OFFLINE') {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center space-y-6">
        <div className="bg-danger/20 border border-danger text-danger p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-2">YOU ARE OFFLINE</h2>
          <p>Live emergency data is unavailable. Please refer to the Offline Survival Guides.</p>
          <Link to="/offline" className="mt-4 inline-block bg-danger text-white px-6 py-3 rounded font-bold shadow hover:bg-red-600 transition-colors">
            Access Offline Emergency Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-12">
      <header className="border-b border-gray-700 pb-4">
        <h1 className="text-4xl font-black text-danger tracking-tight flex items-center">
          <span className="mr-3">🚨</span> EMERGENCY PORTAL
        </h1>
        <p className="text-gray-400 mt-2">Verified public emergency broadcasts, warnings, and contacts.</p>
      </header>

      {/* Verified Warnings */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <span className="w-3 h-3 bg-danger rounded-full mr-2 animate-pulse"></span>
          Active Official Warnings
        </h2>
        {loading ? (
          <p className="text-gray-400">Loading verified warnings...</p>
        ) : warnings.length === 0 ? (
          <div className="bg-dg-surface p-6 rounded-xl border border-dg-success/30 text-dg-success font-bold text-center">
            No critical official warnings active at this time.
          </div>
        ) : (
          <div className="space-y-4">
            {warnings.map((w, i) => (
              <div key={i} className="bg-danger/10 border-2 border-danger p-6 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{w.hazard_type} WARNING</h3>
                  <span className="bg-danger text-white text-xs font-black px-2 py-1 rounded">OFFICIAL WARNING</span>
                </div>
                <p className="text-lg text-gray-200 mb-4">{w.message}</p>
                <div className="text-xs text-gray-400 flex justify-between">
                  <span>Location: {w.location_id || 'Regional'}</span>
                  <span>Issued: {new Date(w.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Evacuation Advisories */}
      {advisories.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center text-warning">
            <span className="w-3 h-3 bg-warning rounded-full mr-2 animate-pulse"></span>
            Active Evacuation Advisories
          </h2>
          <div className="space-y-4">
            {advisories.map((adv, i) => (
              <div key={i} className="bg-warning/10 border-2 border-warning p-6 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{adv.title}</h3>
                  <span className="bg-warning text-darkslate text-xs font-black px-2 py-1 rounded">EVACUATION ADVISORY</span>
                </div>
                <p className="text-lg text-gray-200 mb-4">{adv.description}</p>
                
                <div className="bg-charcoal/50 border border-gray-600 rounded p-4 mb-4">
                  <h4 className="font-bold text-gray-300 text-sm mb-2">Actionable Guidance</h4>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    <li>Proceed to nearest available shelter.</li>
                    <li>Utilize <Link to="/safe-route" className="text-info hover:underline">Lower-Risk Routes</Link>. <em>(Note: Routes are not guaranteed safe)</em></li>
                  </ul>
                </div>

                <div className="text-xs text-gray-400 flex justify-between">
                  <span>Advisory Code: {adv.advisory_code}</span>
                  <span>Issued: {new Date(adv.activated_at || adv.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Emergency Contacts */}
      <section className="bg-dg-surface p-6 rounded-xl border border-dg-border shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-dg-navy">Emergency Contacts (National)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dg-bg p-4 rounded text-center border border-dg-border shadow-sm">
            <div className="text-3xl font-black text-dg-navy">112</div>
            <div className="text-xs text-dg-muted font-bold uppercase tracking-widest mt-1">All Emergencies</div>
          </div>
          <div className="bg-dg-bg p-4 rounded text-center border border-dg-border shadow-sm">
            <div className="text-3xl font-black text-dg-danger">100</div>
            <div className="text-xs text-dg-muted font-bold uppercase tracking-widest mt-1">Police</div>
          </div>
          <div className="bg-dg-bg p-4 rounded text-center border border-dg-border shadow-sm">
            <div className="text-3xl font-black text-dg-warning">101</div>
            <div className="text-xs text-dg-muted font-bold uppercase tracking-widest mt-1">Fire</div>
          </div>
          <div className="bg-dg-bg p-4 rounded text-center border border-dg-border shadow-sm">
            <div className="text-3xl font-black text-dg-info">108</div>
            <div className="text-xs text-dg-muted font-bold uppercase tracking-widest mt-1">Ambulance</div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/shelters" className="bg-dg-surface p-4 rounded-xl border border-dg-border shadow-sm hover:bg-slate-50 text-center transition-colors">
          <span className="text-2xl mb-2 block">🏥</span>
          <span className="font-bold text-dg-navy">Nearby Shelters</span>
        </Link>
        <Link to="/safe-route" className="bg-dg-surface p-4 rounded-xl border border-dg-border shadow-sm hover:bg-slate-50 text-center transition-colors">
          <span className="text-2xl mb-2 block">🗺️</span>
          <span className="font-bold text-dg-navy">Lower-Risk Routes</span>
        </Link>
        <Link to="/offline" className="bg-dg-surface p-4 rounded-xl border border-dg-border shadow-sm hover:bg-slate-50 text-center transition-colors">
          <span className="text-2xl mb-2 block">📚</span>
          <span className="font-bold text-dg-navy">Offline Survival Guides</span>
        </Link>
      </section>
    </div>
  );
};

export default Emergency;

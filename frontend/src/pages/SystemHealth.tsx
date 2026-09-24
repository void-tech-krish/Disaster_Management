import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SystemHealth = () => {
  const { user } = useAuth();
  const isAuthorized = user && (user.role === 'Authority' || user.role === 'Admin');

  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/system-health');
      setHealthData(res.data.data);
    } catch (err) {
      console.error(err);
      // Degraded state fallback if backend itself is failing
      setHealthData({ overall_status: 'OUTAGE', degraded_reasons: ['Cannot connect to backend'], services: [], data_sources: [], events: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchHealth();
      const interval = setInterval(fetchHealth, 30000); // refresh every 30s
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  if (loading) return <div className="p-8 text-gray-400">Loading System Health...</div>;
  
  if (!isAuthorized) return (
    <div className="bg-danger/20 border border-danger text-danger p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-lg">
      <h2 className="text-2xl font-bold mb-2">403 Forbidden</h2>
      <p>Access Denied: Internal diagnostic systems are restricted to Authority personnel.</p>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': case 'OPERATIONAL': return 'text-success border-success bg-success/10';
      case 'DEGRADED': case 'STALE': return 'text-warning border-warning bg-warning/10';
      case 'UNAVAILABLE': case 'OUTAGE': case 'CRITICAL': return 'text-danger border-danger bg-danger/10';
      default: return 'text-gray-400 border-gray-600 bg-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-warning tracking-tight">System Health & Reliability</h1>
          <p className="text-gray-400 text-sm mt-1">Live monitoring of disaster infrastructure, model availability, and data freshness.</p>
        </div>
      </header>

      {/* Degraded Banner */}
      {healthData?.overall_status !== 'OPERATIONAL' && (
        <div className={`p-4 rounded-xl border font-bold flex flex-col ${getStatusColor(healthData.overall_status)}`}>
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚠️</span>
            <span className="text-lg">SYSTEM {healthData.overall_status}</span>
          </div>
          <p className="text-sm font-normal mt-1 opacity-80">Some information may be delayed, unavailable, or strictly relying on last-known-good historical records.</p>
          {healthData?.degraded_reasons?.length > 0 && (
            <ul className="list-disc list-inside mt-2 text-xs font-mono opacity-70">
              {healthData.degraded_reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Core Services */}
        <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Core Services</h2>
          <div className="space-y-3">
            {healthData?.services?.map((svc: any) => (
              <div key={svc.id} className="flex justify-between items-center p-3 bg-charcoal rounded border border-gray-600">
                <div>
                  <h3 className="font-bold text-gray-200">{svc.service_name}</h3>
                  <p className="text-xs text-gray-500">Latency: {svc.response_time_ms}ms {svc.version && `| v${svc.version}`}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`px-2 py-1 border rounded text-[10px] font-bold ${getStatusColor(svc.status)}`}>
                    {svc.status}
                  </span>
                  {svc.error_message && <span className="text-[10px] text-danger mt-1">{svc.error_message}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Data Source Freshness</h2>
          <div className="space-y-3">
            {healthData?.data_sources?.map((ds: any) => (
              <div key={ds.id} className="flex justify-between items-center p-3 bg-charcoal rounded border border-gray-600">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-200">{ds.source_name}</h3>
                    <span className="text-[9px] bg-gray-700 text-gray-300 px-1 rounded uppercase">{ds.source_type}</span>
                  </div>
                  <p className="text-xs text-gray-500">Last fetch: {new Date(ds.last_updated).toLocaleString()}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`px-2 py-1 border rounded text-[10px] font-bold ${getStatusColor(ds.freshness_status)}`}>
                    {ds.freshness_status}
                  </span>
                  {ds.error_message && <span className="text-[10px] text-danger mt-1 truncate w-32">{ds.error_message}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* System Event Timeline */}
      <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">System Event Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {healthData?.events?.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-mono">No recent technical events.</td></tr>
              ) : healthData?.events?.map((evt: any) => (
                <tr key={evt.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(evt.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-gray-300">{evt.service_name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-info">{evt.event_type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 border rounded text-[10px] font-bold ${getStatusColor(evt.severity)}`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{evt.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default SystemHealth;

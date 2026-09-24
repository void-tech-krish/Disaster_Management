import { useState, useEffect } from 'react';
import api from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/alerts');
        setAlerts(res.data.data.alerts);
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getAlertColor = (severity: string) => {
    if (severity === 'CRITICAL') return 'border-danger text-danger bg-danger/10';
    if (severity === 'HIGH') return 'border-warning text-warning bg-warning/10';
    if (severity === 'MODERATE') return 'border-yellow-400 text-yellow-400 bg-yellow-400/10';
    return 'border-info text-info bg-info/10';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Alerts & Notifications</h1>
        <p className="text-gray-400">Review AI-generated warnings and system preparedness reminders.</p>
        <p className="text-xs text-warning mt-2 italic bg-charcoal p-2 rounded inline-block">NOTE: These are simulated alerts for demonstration purposes. Follow local authorities for real emergencies.</p>
      </header>

      {loading ? (
        <div className="text-gray-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-darkslate p-6 rounded-xl border border-gray-700 text-center text-gray-500">
          No active alerts at this time.
        </div>
      ) : (
        <div className="space-y-6">
          {alerts.map((alert) => (
            <div key={alert.id} className={`bg-darkslate p-6 rounded-xl border-l-4 shadow-lg ${getAlertColor(alert.severity).split(' ')[0]}`}>
              <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getAlertColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <h2 className="text-xl font-bold text-white">{alert.title}</h2>
                  </div>
                  <p className="text-sm text-gray-400">Location: <span className="text-white font-semibold">{alert.location}</span> | Hazard: <span className="text-white font-semibold capitalize">{alert.hazard}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-charcoal px-2 py-1 rounded text-gray-400 border border-gray-600 block mb-1">
                    {alert.source_type}
                  </span>
                  <span className="text-[10px] text-gray-500">{alert.status}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reason:</h4>
                <p className="text-gray-200">{alert.message}</p>
              </div>
              
              <div className="bg-charcoal p-4 rounded-lg">
                <h4 className="text-sm font-bold text-warning mb-1">Recommended Action:</h4>
                <p className="text-sm text-gray-300">{alert.recommended_action}</p>
              </div>
              
              <div className="mt-4 flex justify-between text-xs text-gray-500">
                <span>Issued: {new Date(alert.timestamp).toLocaleString()}</span>
                <span>Expires: {new Date(alert.expiry_time).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;

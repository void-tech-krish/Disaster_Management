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
        <h1 className="text-3xl font-extrabold text-dg-navy mb-2">System Alerts & Notifications</h1>
        <p className="text-dg-muted font-medium">Review AI-generated warnings and system preparedness reminders.</p>
        <p className="text-xs text-dg-warning mt-2 font-bold bg-dg-warning/10 p-2 rounded inline-block">NOTE: These are simulated alerts for demonstration purposes. Follow local authorities for real emergencies.</p>
      </header>

      {loading ? (
        <div className="text-dg-muted font-medium">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-dg-surface p-6 rounded-[18px] border border-dg-border text-center text-dg-muted font-medium">
          No active alerts at this time.
        </div>
      ) : (
        <div className="space-y-6">
          {alerts.map((alert) => (
            <div key={alert.id} className={`bg-dg-surface p-6 rounded-[18px] border border-dg-border border-l-4 shadow-sm ${getAlertColor(alert.severity).split(' ')[0]}`}>
              <div className="flex justify-between items-start mb-4 border-b border-dg-border pb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getAlertColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <h2 className="text-xl font-extrabold text-dg-navy">{alert.title}</h2>
                  </div>
                  <p className="text-sm text-dg-muted">Location: <span className="text-dg-navy font-semibold">{alert.location}</span> | Hazard: <span className="text-dg-navy font-semibold capitalize">{alert.hazard}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded text-dg-muted border border-slate-200 block mb-1 font-bold tracking-wide">
                    {alert.source_type}
                  </span>
                  <span className="text-[10px] text-dg-muted font-medium">{alert.status}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-xs text-dg-muted font-bold uppercase tracking-wider mb-1">Reason:</h4>
                <p className="text-dg-navy">{alert.message}</p>
              </div>
              
              <div className="bg-dg-bg border border-dg-border p-4 rounded-xl">
                <h4 className="text-sm font-bold text-dg-warning mb-1">Recommended Action:</h4>
                <p className="text-sm text-dg-navy font-medium">{alert.recommended_action}</p>
              </div>
              
              <div className="mt-4 flex justify-between text-xs text-dg-muted font-medium">
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

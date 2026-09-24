import { useState, useEffect } from 'react';
import api from '../services/api';

const Notifications = () => {
  const [preferences, setPreferences] = useState({
    hazard_type: 'All',
    severity_threshold: 'HIGH',
    channels: { email: true, sms: false, push: false, in_app: true }
  });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const fetchNotificationData = async () => {
    try {
      const [prefsRes, historyRes] = await Promise.all([
        api.get('/notifications/preferences'),
        api.get('/notifications')
      ]);
      
      if (prefsRes.data.data.preferences.length > 0) {
        const pref = prefsRes.data.data.preferences[0];
        setPreferences({
          hazard_type: pref.hazard_type || 'All',
          severity_threshold: pref.severity_threshold || 'HIGH',
          channels: pref.channels || { email: true, sms: false, push: false, in_app: true }
        });
      }
      
      setHistory(historyRes.data.data.notifications);
    } catch (err) {
      console.error('Failed to load notification data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelChange = (channel: string) => {
    setPreferences(prev => ({
      ...prev,
      channels: { ...prev.channels, [channel]: !prev.channels[channel as keyof typeof prev.channels] }
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.post('/notifications/preferences', preferences);
      setMessage('Preferences saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const markAsRead = async (id: string | number) => {
    try {
      await api.post(`/notifications/read/${id}`);
      setHistory(history.map(note => 
        (id === 'all' || note.id === id) ? { ...note, is_read: true } : note
      ));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  if (loading) return <div className="text-gray-400 p-8 text-center">Loading Notification Settings...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold mb-2 text-warning">Notification Center</h1>
        <p className="text-gray-400">Configure your alert preferences and view recent notifications.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Settings Panel */}
        <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">Alert Preferences</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hazard Type</label>
              <select 
                value={preferences.hazard_type}
                onChange={e => setPreferences({...preferences, hazard_type: e.target.value})}
                className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-warning"
              >
                <option value="All">All Hazards</option>
                <option value="Flood">Flood</option>
                <option value="Landslide">Landslide</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Heatwave">Heatwave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Minimum Severity Threshold</label>
              <select 
                value={preferences.severity_threshold}
                onChange={e => setPreferences({...preferences, severity_threshold: e.target.value})}
                className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-warning"
              >
                <option value="LOW">Low (All Alerts)</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-3">Notification Channels</label>
              <div className="space-y-3">
                {['in_app', 'email', 'sms', 'push'].map(channel => (
                  <label key={channel} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={preferences.channels[channel as keyof typeof preferences.channels] || false}
                      onChange={() => handleChannelChange(channel)}
                      disabled={channel === 'in_app'} // In-app is always on
                      className="w-5 h-5 accent-warning cursor-pointer disabled:opacity-50"
                    />
                    <span className={`text-sm uppercase tracking-wider ${channel === 'in_app' ? 'text-gray-500' : 'text-gray-300 group-hover:text-white'}`}>
                      {channel.replace('_', ' ')} {channel === 'in_app' && '(Always On)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <button 
              onClick={savePreferences}
              disabled={saving}
              className="w-full bg-warning text-darkslate font-bold py-2 rounded hover:bg-yellow-500 transition-colors mt-4 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
            {message && <p className="text-sm mt-2 text-center text-success">{message}</p>}
          </div>
        </div>

        {/* History Panel */}
        <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Recent Notifications
              {history.filter(h => !h.is_read).length > 0 && (
                <span className="text-xs bg-danger px-2 py-1 rounded text-white">{history.filter(h => !h.is_read).length} New</span>
              )}
            </h2>
            {history.some(h => !h.is_read) && (
              <button 
                onClick={() => markAsRead('all')}
                className="text-xs text-warning hover:text-yellow-400 underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent notifications.</p>
            ) : (
              history.map(note => (
                <div key={note.id} className={`p-4 rounded border ${note.is_read ? 'bg-charcoal border-gray-700 opacity-80' : 'bg-gray-800 border-warning shadow-md'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        note.severity === 'CRITICAL' ? 'bg-danger/20 text-danger border border-danger/50' :
                        note.severity === 'HIGH' ? 'bg-warning/20 text-warning border border-warning/50' :
                        'bg-info/20 text-info border border-info/50'
                      }`}>
                        {note.severity || note.channel?.toUpperCase()}
                      </span>
                      {note.source_type && (
                        <span className="text-xs text-gray-400 italic">via {note.source_type}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                  {note.title && <h3 className="text-md font-bold text-white mb-1">{note.title}</h3>}
                  <p className="text-sm text-gray-300 mb-3">{note.message}</p>
                  
                  {!note.is_read && (
                    <button 
                      onClick={() => markAsRead(note.id)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;

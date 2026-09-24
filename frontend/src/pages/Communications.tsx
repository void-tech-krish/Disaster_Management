import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';

const Communications: React.FC = () => {
  const { user } = useAuth();
  const [communications, setCommunications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Compose state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [hazardType, setHazardType] = useState('Flood');
  const [severity, setSeverity] = useState('HIGH');
  const [audience, setAudience] = useState('ALL');
  const [preview, setPreview] = useState<string | null>(null);

  const fetchComms = async () => {
    try {
      const res = await api.get('/communications');
      setCommunications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'Authority' || user.role === 'Admin')) {
      fetchComms();
      socket.on('communication:sent', (newComm) => {
        setCommunications((prev) => [newComm, ...prev]);
      });
      return () => {
        socket.off('communication:sent');
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/communications/preview', { title, message, target_audience: audience });
      setPreview(res.data.data.preview);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!window.confirm("Are you sure you want to SEND this EMERGENCY MESSAGE to the public?")) return;
    try {
      await api.post('/communications/send', {
        title,
        message,
        hazard_type: hazardType,
        severity,
        target_audience: audience
      });
      setTitle('');
      setMessage('');
      setPreview(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading Communication Center...</div>;
  if (!user || (user.role !== 'Authority' && user.role !== 'Admin')) {
    return <div className="p-8 text-danger">403 Forbidden</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-info tracking-tight">Communication Center</h1>
        <p className="text-gray-400 text-sm mt-1">Draft, preview, and dispatch emergency communications</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compose Panel */}
        <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Compose Emergency Message</h2>
          <form onSubmit={handlePreview} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Audience</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white text-sm">
                <option value="ALL">All Citizens</option>
                <option value="AFFECTED_ZONES">Affected Zones Only</option>
                <option value="AUTHORITIES">Internal Authorities</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hazard Type</label>
                <input type="text" value={hazardType} onChange={(e) => setHazardType(e.target.value)} className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white text-sm" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Severity</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white text-sm">
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white text-sm" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Message Body</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white text-sm" required />
            </div>
            <button type="submit" className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow">
              Preview Message
            </button>
          </form>

          {preview && (
            <div className="mt-6 border-t border-gray-700 pt-6">
              <h3 className="text-sm font-bold text-gray-400 mb-2">Message Preview:</h3>
              <div className="bg-charcoal p-4 rounded border border-info whitespace-pre-wrap text-sm text-white font-mono">
                {preview}
              </div>
              <button onClick={handleSend} className="w-full mt-4 bg-danger hover:bg-red-600 text-white font-bold py-3 px-4 rounded shadow uppercase tracking-wider">
                Authorized: Send Message
              </button>
            </div>
          )}
        </div>

        {/* History Panel */}
        <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Communication History</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {communications.length === 0 ? <p className="text-gray-400 text-sm">No recent communications.</p> : communications.map(c => (
              <div key={c.id} className="bg-charcoal p-4 rounded border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-md">{c.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${c.delivery_status === 'SENT' ? 'bg-success text-darkslate' : 'bg-warning text-darkslate'}`}>
                    {c.delivery_status}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mb-2">{c.message}</p>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>Audience: {c.target_audience}</span>
                  <span>{new Date(c.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communications;

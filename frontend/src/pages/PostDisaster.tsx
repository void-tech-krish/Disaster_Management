import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { socket } from '../services/socket';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PostDisaster = () => {
  const { user } = useAuth();
  const isAuthorized = user && (user.role === 'Authority' || user.role === 'Admin');

  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await api.get('/incidents');
      setIncidents(res.data.data.incidents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchIncidents();
      
      const onIncidentChange = () => fetchIncidents();
      socket.on('incident:created', onIncidentChange);
      socket.on('incident:updated', onIncidentChange);
      
      return () => {
        socket.off('incident:created', onIncidentChange);
        socket.off('incident:updated', onIncidentChange);
      };
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  if (loading) return <div className="p-8 text-gray-400">Loading Post-Disaster Analysis...</div>;
  
  if (!isAuthorized) return (
    <div className="bg-danger/20 border border-danger text-danger p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-lg">
      <h2 className="text-2xl font-bold mb-2">403 Forbidden</h2>
      <p>Access Denied: You must be logged in with 'Authority' or 'Admin' privileges to access Post-Disaster Analysis.</p>
    </div>
  );

  const analyticsData = incidents.length > 0 ? [
    { name: 'Flood', count: incidents.filter(i => i.hazard_type === 'Flood').length },
    { name: 'Cyclone', count: incidents.filter(i => i.hazard_type === 'Cyclone').length },
    { name: 'Landslide', count: incidents.filter(i => i.hazard_type === 'Landslide').length },
    { name: 'Heatwave', count: incidents.filter(i => i.hazard_type === 'Heatwave').length },
  ] : [
    { name: 'Flood', count: 0 }, { name: 'Cyclone', count: 0 }, { name: 'Landslide', count: 0 }, { name: 'Heatwave', count: 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-warning tracking-tight">Post-Disaster Analysis & Incident Management</h1>
          <p className="text-gray-400 text-sm mt-1">Operational view of active and historical disaster incidents.</p>
        </div>
        <button className="bg-success text-white px-4 py-2 rounded font-bold hover:bg-green-600 shadow border border-green-500">
          + New Incident
        </button>
      </header>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-lg font-bold mb-2">Summary Metrics</h2>
          <div className="space-y-4 mt-4">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Total Incidents</span>
              <span className="font-bold text-white">{incidents.length}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Active Incidents</span>
              <span className="font-bold text-danger">{incidents.filter(i => i.status === 'ACTIVE').length}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Closed / Recovered</span>
              <span className="font-bold text-success">{incidents.filter(i => i.status === 'CLOSED' || i.status === 'RECOVERING').length}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-lg font-bold mb-4">Incidents by Hazard (Analytics)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Bar dataKey="count" fill="#3b82f6" name="Incidents" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="bg-darkslate rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
          <h2 className="text-lg font-bold">Incident Log</h2>
          <input type="text" placeholder="Search incidents..." className="bg-charcoal border border-gray-600 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-info" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID / Code</th>
                <th className="px-4 py-3">Title & Hazard</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reported</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No incidents recorded.</td>
                </tr>
              ) : incidents.map((inc) => (
                <tr key={inc.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono">{inc.incident_code}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-white">{inc.title}</div>
                    <div className="text-xs text-gray-500">{inc.hazard_type}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-danger text-white' : 
                      inc.severity === 'HIGH' ? 'bg-warning text-darkslate' : 
                      'bg-info text-darkslate'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 border rounded text-xs font-bold ${
                      inc.status === 'CLOSED' ? 'border-success text-success' : 'border-gray-500 text-gray-300'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{new Date(inc.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/incidents/${inc.id}`} className="text-info hover:underline text-sm font-bold">
                      View Analysis &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PostDisaster;

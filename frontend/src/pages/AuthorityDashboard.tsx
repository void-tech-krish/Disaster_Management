// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { socket } from '../services/socket';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import EventTimeline from '../components/EventTimeline';
import 'leaflet/dist/leaflet.css';

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const isAuthorized = user && (user.role === 'Authority' || user.role === 'Admin');
  
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(socket.connected);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, alertsRes, timeRes, respRes] = await Promise.all([
        api.get('/authority/summary'),
        api.get('/alerts'),
        api.get('/timeline'),
        api.get('/responses').catch(() => ({ data: { data: [] } }))
      ]);
      setSummary(sumRes.data.data.summary);
      setAlerts(alertsRes.data.data.alerts.slice(0, 5)); // top 5
      setTimeline(timeRes.data.data.timeline.slice(0, 10)); // top 10
      setResponses(respRes.data.data);
    } catch (err) {
      console.error('Error fetching authority data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchDashboardData();
      
      const onConnect = () => setIsLive(true);
      const onDisconnect = () => setIsLive(false);
      const onRefreshEvent = () => fetchDashboardData();

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('new_notification', onRefreshEvent);
      socket.on('risk.updated', onRefreshEvent);
      socket.on('resource.updated', onRefreshEvent);

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('new_notification', onRefreshEvent);
        socket.off('risk.updated', onRefreshEvent);
        socket.off('resource.updated', onRefreshEvent);
      };
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  if (loading) return <div className="text-gray-400 p-8">Loading Emergency Operations Center...</div>;

  if (!isAuthorized) return (
    <div className="bg-danger/20 border border-danger text-danger p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-lg">
      <h2 className="text-2xl font-bold mb-2">403 Forbidden</h2>
      <p>Access Denied: You must be logged in with 'Authority' or 'Admin' privileges to access the Emergency Operations Center.</p>
    </div>
  );

  const COLORS = ['#3b82f6', '#f97316', '#ef4444', '#facc15'];
  const hazardData = [
    { name: 'Flood', value: 45 },
    { name: 'Landslide', value: 25 },
    { name: 'Earthquake', value: 20 },
    { name: 'Heatwave', value: 10 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <header className="border-b border-gray-700 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-warning tracking-tight">Authority Response Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Emergency Operations Center (EOC) - Decision Support System</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-4">
          <a href="/authority/evacuation" className="bg-warning text-darkslate px-4 py-2 rounded text-sm font-bold shadow hover:bg-yellow-500 transition-colors">
            Evacuation & Shelters &rarr;
          </a>
          <a href="/authority/community-reports" className="bg-success text-darkslate px-4 py-2 rounded text-sm font-bold shadow hover:bg-green-500 transition-colors">
            Community Reports &rarr;
          </a>
          <a href="/recovery" className="bg-info px-4 py-2 rounded text-sm text-darkslate font-bold shadow hover:bg-blue-400 transition-colors">
            Recovery Dashboard &rarr;
          </a>
          <a href="/post-disaster" className="bg-charcoal px-4 py-2 rounded text-sm text-gray-300 hover:text-white border border-gray-600 shadow transition-colors">
            Post-Disaster Analysis &rarr;
          </a>
          <a href="/system-health" className="flex items-center space-x-2 bg-darkslate px-3 py-1.5 rounded border border-gray-700 hover:border-gray-500 transition-colors">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-danger'}`}></div>
            <span className="text-sm font-bold text-gray-300">{isLive ? 'SYSTEM OPERATIONAL' : 'SYSTEM DEGRADED'}</span>
          </a>
          <a href="/audit-logs" className="bg-charcoal px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white border border-gray-600 shadow transition-colors" title="View Audit & Security Logs">
            🛡️ Audit Logs
          </a>
        </div>
      </header>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Critical Locations', val: summary?.criticalLocations, col: 'text-danger' },
          { label: 'High Risk Areas', val: summary?.highRiskLocations, col: 'text-warning' },
          { label: 'Official Warnings', val: summary?.officialWarnings, col: 'text-danger' },
          { label: 'Pop. At Risk', val: summary?.populationAtRisk?.toLocaleString(), col: 'text-white' },
          { label: 'Open Shelters', val: `${summary?.openShelters}/${summary?.totalShelters}`, col: 'text-success' },
          { label: 'Avail. Resources', val: summary?.availableResources, col: 'text-info' },
        ].map((s, i) => (
          <div key={i} className="bg-darkslate p-4 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-center text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.col}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Map & Alerts) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Risk Map */}
          <div className="bg-darkslate rounded-xl border border-gray-700 shadow-lg overflow-hidden h-[400px] relative">
            <div className="absolute top-4 left-4 z-[1000] bg-charcoal/90 p-3 rounded shadow border border-gray-600">
              <h3 className="font-bold text-sm text-white mb-2">Live Risk Map</h3>
              <div className="space-y-1 text-xs text-gray-300">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-danger mr-2"></div> Critical Zone</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-warning mr-2"></div> High Risk</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-info mr-2"></div> Resource Hub</div>
              </div>
            </div>
            <MapContainer center={[16.5062, 80.6480]} zoom={10} style={{ height: '100%', width: '100%', background: '#1f2937' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {/* Demo map entities for EOC display */}
              <Circle center={[16.5062, 80.6480]} radius={5000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }}>
                <Popup><span className="text-black font-bold">Zone Alpha (CRITICAL)</span></Popup>
              </Circle>
              <Marker position={[16.6062, 80.7480]}>
                <Popup><span className="text-black font-bold">Base Camp 1 (Resources)</span></Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Emergency Response Center */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-info">Emergency Response Center</h2>
              <a href="/communications" className="bg-info text-darkslate px-3 py-1.5 rounded text-sm font-bold shadow hover:bg-blue-400 transition-colors">
                Communication Center &rarr;
              </a>
            </div>
            <div className="space-y-3">
              {responses.length === 0 ? <p className="text-gray-400">No active response cases.</p> : responses.map((r, i) => (
                <div key={i} className="p-4 rounded border border-gray-600 bg-charcoal flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${r.status === 'PENDING_REVIEW' ? 'bg-warning text-darkslate' : 'bg-info text-white'}`}>{r.status}</span>
                      <span className="font-bold">{r.response_code}</span>
                      <span className="text-gray-400 text-sm">| {r.hazard_type}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">Location: {r.location_name || 'Regional'}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {r.status === 'PENDING_REVIEW' ? (
                      <button className="bg-warning text-darkslate text-xs px-4 py-2 rounded font-bold hover:bg-yellow-500 shadow">Review & Activate</button>
                    ) : (
                      <a href={`/response/${r.id}`} className="bg-gray-700 text-white text-center text-xs px-4 py-2 rounded hover:bg-gray-600 border border-gray-500 block">Manage Case</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Active Alerts & Warnings</h2>
              <a href="/alerts" className="text-info text-sm hover:underline">View All</a>
            </div>
            <div className="space-y-3">
              {alerts.length === 0 ? <p className="text-gray-400">No active alerts.</p> : alerts.map((a, i) => (
                <div key={i} className={`p-4 rounded border flex justify-between items-start ${a.severity === 'CRITICAL' ? 'bg-danger/10 border-danger' : 'bg-warning/10 border-warning'}`}>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${a.severity === 'CRITICAL' ? 'bg-danger text-white' : 'bg-warning text-darkslate'}`}>{a.severity}</span>
                      <span className="font-bold">{a.hazard_type}</span>
                      {a.source === 'OFFICIAL WARNING' && <span className="bg-info text-darkslate text-[10px] px-2 rounded font-black tracking-wide">OFFICIAL WARNING</span>}
                      {a.source === 'AI RISK ASSESSMENT' && <span className="bg-purple-600 text-white text-[10px] px-2 rounded font-black tracking-wide">AI ASSESSMENT</span>}
                    </div>
                    <p className="text-sm text-gray-300">{a.message}</p>
                    <p className="text-xs text-gray-500 mt-2">Location: {a.location_id || 'Regional'} • Issued: {new Date(a.created_at).toLocaleTimeString()}</p>
                  </div>
                  <button className="bg-charcoal text-gray-300 text-xs px-3 py-1 rounded hover:bg-gray-700 border border-gray-600">Acknowledge</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Analytics, Shortages, Timeline) */}
        <div className="space-y-6">
          
          {/* Risk Summary Chart */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Hazard Distribution</h2>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={hazardData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" label={false}>
                    {hazardData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Shortages */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-danger flex items-center"><span className="mr-2">⚠️</span> Critical Shortages</h2>
              <a href="/resources" className="text-info text-sm hover:underline">Manage</a>
            </div>
            <div className="space-y-3">
              <div className="bg-charcoal p-3 rounded border border-danger/40 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-white">AMBULANCE</p>
                  <p className="text-xs text-gray-400">Zone Alpha</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-danger font-bold">Shortage: 6</p>
                  <p className="text-[10px] text-gray-500">AI-ASSISTED RECOMMENDATION</p>
                </div>
              </div>
              <div className="bg-charcoal p-3 rounded border border-danger/40 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-white">RESCUE TEAM</p>
                  <p className="text-xs text-gray-400">Zone Alpha</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-danger font-bold">Shortage: 3</p>
                  <p className="text-[10px] text-gray-500">AI-ASSISTED RECOMMENDATION</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health / Data Source Status */}
          <div className="bg-darkslate p-4 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-sm font-bold mb-3 text-gray-300">Data Source Status</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-charcoal p-2 rounded flex justify-between items-center">
                <span className="text-gray-400">Risk Engine</span>
                <span className="text-success font-bold">LIVE</span>
              </div>
              <div className="bg-charcoal p-2 rounded flex justify-between items-center">
                <span className="text-gray-400">Weather API</span>
                <span className="text-success font-bold">LIVE</span>
              </div>
              <div className="bg-charcoal p-2 rounded flex justify-between items-center">
                <span className="text-gray-400">Shelter Data</span>
                <span className="text-warning font-bold">STALE</span>
              </div>
              <div className="bg-charcoal p-2 rounded flex justify-between items-center">
                <span className="text-gray-400">Census Data</span>
                <span className="text-purple-400 font-bold">DEMO</span>
              </div>
            </div>
          </div>

          {/* Recent Response Activity */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Response Activity</h2>
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <EventTimeline events={timeline} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;

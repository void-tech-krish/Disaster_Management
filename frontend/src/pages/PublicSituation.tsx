import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';

// Fix for leaflet default icons in React
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const PublicSituation = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repRes, altRes] = await Promise.all([
          api.get('/community-reports/public').catch(() => ({ data: { data: [] } })),
          api.get('/alerts').catch(() => ({ data: { data: { alerts: [] } } }))
        ]);
        setReports(repRes.data?.data || []);
        setAlerts(altRes.data?.data?.alerts || []);
      } catch (err) {
        console.error("Failed to load public situation data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-gray-400">Loading Public Transparency Map...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-white">Public Transparency Map</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Live situational awareness combining official warnings and <strong className="text-success">Verified Citizen Observations</strong>. 
          <br />Locations of citizen reports are approximate to protect privacy.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Map Area */}
        <div className="lg:col-span-3 bg-darkslate rounded-xl border border-gray-700 shadow-xl overflow-hidden h-[600px] relative">
          
          {/* Map Legend overlay */}
          <div className="absolute top-4 right-4 z-[1000] bg-charcoal/90 p-4 rounded-lg shadow-xl border border-gray-600 backdrop-blur-sm">
            <h3 className="font-bold text-sm text-white mb-3">Map Legend</h3>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-danger/30 border-2 border-danger mr-2"></div>
                Official Warning Area
              </div>
              <div className="flex items-center mt-2">
                <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
                Verified Citizen Report
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                AI Risk Assessment
              </div>
            </div>
          </div>

          <MapContainer center={[16.5062, 80.6480]} zoom={10} style={{ height: '100%', width: '100%', background: '#1f2937' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {/* Render Official Alerts (simplified as circles for demo if coords aren't full polygons) */}
            {alerts.map((a, i) => (
               <Circle key={`alert-${i}`} center={[16.5062, 80.6480]} radius={8000} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }}>
                 <Popup>
                   <div className="p-1">
                     <span className="bg-danger text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase mb-1 inline-block">Official Warning</span>
                     <h3 className="font-bold text-sm text-gray-800">{a.hazard_type}</h3>
                     <p className="text-xs text-gray-600 mt-1">{a.message}</p>
                   </div>
                 </Popup>
               </Circle>
            ))}

            {/* Render Citizen Reports */}
            {reports.map((r, i) => {
              if (!r.latitude || !r.longitude) return null;
              return (
                <Marker key={`report-${i}`} position={[r.latitude, r.longitude]}>
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <span className="bg-success text-darkslate text-[10px] px-2 py-0.5 rounded font-bold uppercase mb-1 inline-block">Verified Citizen Report</span>
                      <h3 className="font-bold text-sm text-gray-800">{r.category}</h3>
                      <p className="text-xs text-gray-600 mt-1">{r.description}</p>
                      <div className="text-[10px] text-gray-500 mt-2">Observed: {new Date(r.observed_at).toLocaleString()}</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-darkslate border border-gray-700 p-5 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center"><span className="mr-2">📢</span> Recent Observations</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {reports.length === 0 ? <p className="text-gray-500 text-sm">No recent community observations.</p> : reports.map((r, i) => (
                <div key={i} className="bg-charcoal border border-gray-600 p-3 rounded text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gray-200">{r.category}</span>
                    <span className="text-[10px] bg-success/20 text-success border border-success/30 px-2 py-0.5 rounded font-bold">VERIFIED</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                  <p className="text-[10px] text-gray-500 mt-2">{new Date(r.observed_at).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicSituation;

// @ts-nocheck
import { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const SafeRoute = () => {
  const [start, setStart] = useState('Vijayawada City Center');
  const [dest, setDest] = useState('Relief Camp Alpha');
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/safe-route', { start, destination: dest });
      setRoutes(res.data.data.routes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (exposure: string) => {
    if (exposure === 'HIGH' || exposure === 'CRITICAL') return 'text-danger border-danger';
    if (exposure === 'MODERATE') return 'text-warning border-warning';
    return 'text-success border-success';
  };

  const getPolylineColor = (exposure: string) => {
    if (exposure === 'HIGH' || exposure === 'CRITICAL') return '#ef4444'; // red
    return '#22c55e'; // green
  };

  // Bounds roughly around the mock coordinates
  const center: [number, number] = [20.6, 79.0];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Disaster-Aware Routing <span className="text-[10px] ml-2 align-top bg-warning/20 text-warning px-1 rounded uppercase tracking-widest">Demo</span></h1>
        <p className="text-gray-400">Calculate routes avoiding active hazard zones.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Form & Results */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleSearch} className="bg-darkslate p-6 rounded-xl border border-gray-700">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Start Location</label>
                <input 
                  type="text" 
                  value={start}
                  onChange={e => setStart(e.target.value)}
                  className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white focus:border-warning outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Destination</label>
                <input 
                  type="text" 
                  value={dest}
                  onChange={e => setDest(e.target.value)}
                  className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white focus:border-warning outline-none" 
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-warning text-darkslate font-bold py-2 rounded hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Find Safe Route'}
              </button>
            </div>
          </form>

          {routes.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">Route B has greater distance but lower exposure to current assessed risk zones.</p>
              {routes.map(r => (
                <div key={r.id} className={`bg-darkslate p-4 rounded-xl border-l-4 ${getRiskColor(r.risk_exposure)} shadow-lg`}>
                  <h3 className="font-bold text-lg mb-2">{r.name}</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Distance: <span className="text-white font-semibold">{r.distance}</span></p>
                    <p>Est. Time: <span className="text-white font-semibold">{r.time}</span></p>
                    <p>Risk Exposure: <span className={`font-bold ${getRiskColor(r.risk_exposure).split(' ')[0]}`}>{r.risk_exposure}</span></p>
                    {r.affected_zones.length > 0 && (
                      <p className="text-xs text-danger mt-2">⚠️ Crosses: {r.affected_zones.join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Map */}
        <div className="lg:col-span-2 h-[600px] rounded-xl overflow-hidden border border-gray-700 shadow-xl relative">
          {!routes.length && !loading && (
            <div className="absolute inset-0 bg-darkslate/80 z-[1000] flex items-center justify-center">
              <span className="text-gray-400 text-lg">Enter start and destination to calculate routes.</span>
            </div>
          )}
          <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routes.map(r => (
              <Polyline 
                key={r.id} 
                positions={r.polyline} 
                color={getPolylineColor(r.risk_exposure)} 
                weight={r.risk_exposure === 'LOW' ? 6 : 4} 
                dashArray={r.risk_exposure === 'HIGH' ? '5, 10' : ''}
              >
                <Popup>
                  <div className="text-darkslate font-bold">{r.name}</div>
                </Popup>
              </Polyline>
            ))}
            {routes.length > 0 && (
              <>
                <Marker position={routes[0].polyline[0]}><Popup>Start</Popup></Marker>
                <Marker position={routes[0].polyline[routes[0].polyline.length-1]}><Popup>Destination</Popup></Marker>
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default SafeRoute;

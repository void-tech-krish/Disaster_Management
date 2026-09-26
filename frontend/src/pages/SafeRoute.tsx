// @ts-nocheck
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker, useMap, ZoomControl } from 'react-leaflet';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});



const SafeRoute = () => {
  const [selectedLocation, setSelectedLocation] = useState<{city: string, state: string, lat: number, lng: number} | null>(null);
  
  const [states, setStates] = useState<any[]>([]);
  const [startCities, setStartCities] = useState<any[]>([]);

  const [startStateId, setStartStateId] = useState<string>('');
  const [startCityId, setStartCityId] = useState<string>('');

  const [routes, setRoutes] = useState<any[]>([]);
  const [destinationCamp, setDestinationCamp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.6, 79.0]);

  useEffect(() => {
    api.get('/states').then(res => setStates(res.data.data.states)).catch(console.error);
  }, []);

  useEffect(() => {
    setStartCityId('');
    setRoutes([]);
    setSelectedLocation(null);
    setDestinationCamp(null);
    if (startStateId) {
      api.get(`/states/${startStateId}/cities`).then(res => setStartCities(res.data.data.cities)).catch(console.error);
    } else {
      setStartCities([]);
    }
  }, [startStateId]);

  const handleStartCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setStartCityId(cityId);
    setRoutes([]);
    setDestinationCamp(null);
    if (cityId) {
      const city = startCities.find(c => c.id.toString() === cityId);
      const state = states.find(s => s.id.toString() === startStateId);
      if (city && state) {
        setSelectedLocation({
          city: city.name,
          state: state.name,
          lat: parseFloat(city.latitude),
          lng: parseFloat(city.longitude)
        });
        setMapCenter([parseFloat(city.latitude), parseFloat(city.longitude)]);
      }
    } else {
      setSelectedLocation(null);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("Please select a location first.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/safe-route', { 
        location: { lat: selectedLocation.lat, lng: selectedLocation.lng }
      });
      setRoutes(res.data.data.routes);
      setDestinationCamp(res.data.data.destination);
      if (res.data.data.origin) {
        setMapCenter([res.data.data.origin.latitude, res.data.data.origin.longitude]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to calculate route.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (exposure: string) => {
    if (exposure === 'CRITICAL') return 'text-[#ef4444] border-[#ef4444]';
    if (exposure === 'HIGH') return 'text-[#f97316] border-[#f97316]';
    if (exposure === 'MODERATE') return 'text-[#facc15] border-[#facc15]';
    return 'text-[#22c55e] border-[#22c55e]';
  };

  const getPolylineColor = (exposure: string) => {
    if (exposure === 'CRITICAL') return '#ef4444';
    if (exposure === 'HIGH') return '#f97316';
    if (exposure === 'MODERATE') return '#facc15';
    return '#22c55e';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-dg-navy mb-2">Disaster-Aware Routing <span className="text-[10px] ml-2 align-top bg-dg-warning/20 text-dg-warning px-1 rounded uppercase tracking-widest">Demo</span></h1>
          <p className="text-dg-muted font-medium">Calculate routes avoiding active hazard zones.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Form & Results */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleSearch} className="bg-dg-surface p-6 rounded-[18px] border border-dg-border shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dg-muted mb-1 uppercase tracking-wider">Start State</label>
                <select 
                  value={startStateId}
                  onChange={e => setStartStateId(e.target.value)}
                  className="w-full bg-dg-bg border border-dg-border rounded-lg px-3 py-2 text-dg-navy focus:border-dg-primary outline-none appearance-none mb-3" 
                >
                  <option value="">-- Select State / UT --</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </select>

                <label className="block text-xs font-bold text-dg-muted mb-1 uppercase tracking-wider">Start City</label>
                <select 
                  value={startCityId}
                  onChange={handleStartCityChange}
                  disabled={!startStateId || startCities.length === 0}
                  className="w-full bg-dg-bg border border-dg-border rounded-lg px-3 py-2 text-dg-navy focus:border-dg-primary outline-none appearance-none mb-3 disabled:opacity-50" 
                >
                  <option value="">-- Select City --</option>
                  {startCities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-dg-primary text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Calculating live route...' : 'Find Safe Route'}
              </button>
            </div>
          </form>

          {routes.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs text-dg-muted font-medium">Route B has greater distance but lower exposure to current assessed risk zones.</p>
              {routes.map(r => (
                <div key={r.id} className={`bg-dg-surface p-4 rounded-xl border border-dg-border border-l-4 shadow-sm`} style={{ borderLeftColor: getPolylineColor(r.risk_exposure) }}>
                  <h3 className="font-bold text-lg text-dg-navy mb-2">{r.name}</h3>
                  <div className="text-sm text-dg-muted space-y-1">
                    <p>Distance: <span className="text-dg-navy font-semibold">{r.distance}</span></p>
                    <p>Est. Time: <span className="text-dg-navy font-semibold">{r.time}</span></p>
                    <p>Risk Exposure: <span className="font-bold" style={{ color: getPolylineColor(r.risk_exposure) }}>{r.risk_exposure}</span></p>
                    {r.affected_zones.length > 0 && (
                      <p className="text-xs text-dg-danger mt-2">⚠️ Crosses: {r.affected_zones.join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Map */}
        <div className="lg:col-span-2 h-[600px] rounded-[18px] overflow-hidden border border-dg-border shadow-sm relative">
          {/* Legend */}
          <div className="absolute bottom-6 left-4 z-[1000] bg-dg-surface/90 p-4 rounded-xl border border-dg-border shadow-sm text-xs">
            <h4 className="font-bold mb-2 uppercase text-dg-muted tracking-wider">Risk Exposure</h4>
            <div className="space-y-1 font-medium text-dg-navy">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#ef4444] mr-2"></span> CRITICAL</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#f97316] mr-2"></span> HIGH</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#facc15] mr-2"></span> MODERATE</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#22c55e] mr-2"></span> LOW</div>
            </div>
          </div>

          {!routes.length && !loading && (
            <div className="absolute inset-0 bg-white/90 z-[1000] flex items-center justify-center">
              <span className="text-dg-muted text-lg font-medium">Enter start and destination to calculate routes.</span>
            </div>
          )}
          <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
            <MapUpdater center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`}
            />
            {routes.map(r => (
              <Polyline 
                key={r.id} 
                positions={r.polyline} 
                color={getPolylineColor(r.risk_exposure)} 
                weight={r.risk_exposure === 'LOW' ? 6 : 4} 
                dashArray={r.risk_exposure === 'HIGH' || r.risk_exposure === 'CRITICAL' ? '5, 10' : ''}
              >
                <Popup>
                  <div className="p-2 w-48 font-sans">
                    <h3 className="font-extrabold text-lg mb-1 text-dg-navy">{r.name}</h3>
                    <div className="text-sm space-y-1 text-dg-navy">
                      <p>Distance: <strong>{r.distance}</strong></p>
                      <p>Est. Time: <strong>{r.time}</strong></p>
                      <p>Exposure: <span className="font-bold" style={{ color: getPolylineColor(r.risk_exposure) }}>{r.risk_exposure}</span></p>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            ))}
            {routes.length > 0 && (
              <>
                <Marker position={routes[0].polyline[0]}>
                  <Popup>
                    <div className="p-2 w-32 font-sans text-center">
                      <h3 className="font-extrabold text-lg mb-1 text-dg-navy">Start</h3>
                    </div>
                  </Popup>
                </Marker>
                <Marker position={routes[0].polyline[routes[0].polyline.length-1]}>
                  <Popup>
                    <div className="p-2 w-32 font-sans text-center">
                      <h3 className="font-extrabold text-lg mb-1 text-dg-navy">{destinationCamp ? destinationCamp.name : 'Destination'}</h3>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default SafeRoute;

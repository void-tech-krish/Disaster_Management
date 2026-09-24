// @ts-nocheck
import { useState, useEffect } from 'react';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon for shelters
const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Shelters = () => {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        // Fetch all shelters (or could pass specific location lat/lon)
        const res = await api.get('/shelters/nearby');
        setShelters(res.data.data.shelters);
      } catch (err) {
        console.error('Error fetching shelters:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShelters();
  }, []);

  const center: [number, number] = [20.5937, 78.9629]; // Default India

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Emergency Shelters <span className="text-sm bg-warning/20 text-warning px-2 py-1 rounded ml-2">DEMO SHELTER DATA</span></h1>
        <p className="text-gray-400">Locate nearby safe zones and emergency response centers.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {loading ? (
            <div className="text-gray-400">Loading shelters...</div>
          ) : shelters.length === 0 ? (
            <div className="text-gray-500 italic">No shelters found. Ensure database is seeded.</div>
          ) : (
            shelters.map((s, idx) => (
              <div key={idx} className="bg-darkslate p-4 rounded-xl border border-gray-700 hover:border-success transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-success">{s.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${s.accessibility_status === 'OPEN' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {s.accessibility_status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Distance: {s.distance_meters ? (s.distance_meters / 1000).toFixed(1) + ' km' : 'N/A'}</p>
                  <p>Capacity: {s.capacity}</p>
                  <p>Occupied: {s.occupancy}</p>
                  <p className="text-gray-200">Available: <span className="font-bold">{s.available}</span></p>
                  {s.medical_support && <p className="text-warning font-semibold mt-1 flex items-center">✚ Medical Support Available</p>}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2 h-[600px] rounded-xl overflow-hidden border border-gray-700 shadow-xl">
          <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {shelters.map((s, idx) => (
              <Marker key={idx} position={[s.lat, s.lon]} icon={shelterIcon}>
                <Popup>
                  <div className="text-darkslate p-1">
                    <h3 className="font-bold text-lg mb-1">{s.name}</h3>
                    <p className="text-sm">Available Space: <strong>{s.available}</strong></p>
                    <p className="text-sm">Status: {s.accessibility_status}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Shelters;

// @ts-nocheck
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// no LocationContext
import api from '../services/api';

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface EmergencyService {
  id: number;
  name: string;
  service_type: string;
  distance_km: number;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  is_verified: boolean;
  source_type: string;
  last_verified_at: string;
}

// Component to dynamically update map center
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const EmergencyServices = () => {
  const selectedLocation = { lat: 16.5062, lng: 80.6480, name: 'Vijayawada' };
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [types, setTypes] = useState<string[]>(['All']);
  const [selectedType, setSelectedType] = useState('All');
  const [radius, setRadius] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get('/emergency-services/types');
        setTypes(['All', ...res.data.data.types]);
      } catch (err) {
        console.error('Failed to fetch service types', err);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (!selectedLocation) return;
    setMapCenter([selectedLocation.lat, selectedLocation.lng]);

    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/emergency-services', {
          params: {
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            type: selectedType,
            radius: radius
          }
        });
        setServices(res.data.data.services);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch emergency services. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedLocation, selectedType, radius]);

  const handleViewOnMap = (service: EmergencyService) => {
    if (service.latitude && service.longitude) {
      setMapCenter([service.latitude, service.longitude]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="border-b border-dg-border pb-4">
        <h1 className="text-3xl font-extrabold mb-2 text-dg-primary">Emergency Services</h1>
        <p className="text-dg-muted font-medium">Find nearby verified emergency services, hospitals, and disaster response centers.</p>
      </header>

      {/* Emergency Action Panel */}
      <div className="bg-red-50 border border-dg-danger p-6 rounded-[18px] space-y-2">
        <h2 className="text-xl font-bold text-dg-danger flex items-center">
          <span className="mr-2">⚠️</span> EMERGENCY ACTION GUIDANCE
        </h2>
        <p className="text-dg-danger font-medium">For immediate danger:</p>
        <ol className="list-decimal list-inside text-red-700 space-y-1 font-medium">
          <li>Move to a safer location if possible.</li>
          <li>Follow official emergency instructions.</li>
          <li>Contact the appropriate verified emergency service.</li>
          <li>Do not rely solely on the AI risk assessment.</li>
        </ol>
      </div>

      {!selectedLocation ? (
        <div className="bg-dg-surface p-8 rounded-[18px] text-center border border-dg-border shadow-sm">
          <p className="text-dg-muted font-medium">Please select a location in the dashboard to find nearby emergency services.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between bg-dg-surface p-6 rounded-[18px] border border-dg-border shadow-sm">
            <div>
              <p className="text-sm font-bold text-dg-muted uppercase tracking-wider">Current Location</p>
              <p className="font-extrabold text-dg-navy text-xl">{selectedLocation.name}</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-bold text-dg-muted block mb-1 uppercase tracking-wider">Service Type</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-dg-bg border border-dg-border rounded-lg px-4 py-2 text-dg-navy focus:outline-none focus:border-dg-primary font-medium"
                >
                  {types.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-dg-muted block mb-1 uppercase tracking-wider">Radius</label>
                <select 
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="bg-dg-bg border border-dg-border rounded-lg px-4 py-2 text-dg-navy focus:outline-none focus:border-dg-primary font-medium"
                >
                  <option value="2">2 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                </select>
              </div>
            </div>
          </div>

          {/* Map Visualization */}
          {mapCenter && (
            <div className="h-96 w-full rounded-xl overflow-hidden border border-gray-700 shadow-xl relative z-0">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={mapCenter} />
                
                {/* User Location Marker */}
                <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                  <Popup>
                    <strong>Your Location</strong><br/>
                    {selectedLocation.name}
                  </Popup>
                </Marker>

                {/* Services Markers */}
                {services.map((service, idx) => service.latitude && service.longitude && (
                  <Marker key={service.id || idx} position={[service.latitude, service.longitude]}>
                    <Popup>
                      <div className="text-darkslate p-1">
                        <strong className="text-base">{service.name}</strong><br/>
                        <span className="text-xs uppercase text-blue-600 font-bold">{service.service_type}</span><br/>
                        <span className="text-xs">{service.distance_km} km away</span><br/>
                        {service.phone && <a href={`tel:${service.phone}`} className="text-blue-500 underline text-sm mt-1 inline-block">Call: {service.phone}</a>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-dg-muted font-medium animate-pulse">Searching nearby services from Overpass...</div>
          ) : error ? (
            <div className="bg-red-50 text-dg-danger p-4 rounded-xl border border-dg-danger">{error}</div>
          ) : services.length === 0 ? (
            <div className="bg-dg-surface p-12 text-center rounded-[18px] border border-dg-border shadow-sm">
              <p className="text-xl font-bold text-dg-navy mb-2">No verified emergency services found within this radius.</p>
              <p className="text-dg-muted font-medium">Try increasing the search radius or changing the service type.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, idx) => (
                <div key={service.id || idx} className="bg-dg-surface p-6 rounded-[18px] border border-dg-border shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-extrabold text-lg text-dg-navy">{service.name}</h3>
                      <span className="text-xs bg-orange-50 px-2 py-1 rounded-md text-dg-primary font-bold border border-orange-200 ml-2 whitespace-nowrap">
                        {service.distance_km} km
                      </span>
                    </div>
                    <p className="text-sm font-bold text-dg-muted uppercase tracking-wider mb-4">{service.service_type}</p>
                    
                    <div className="space-y-2 text-sm text-dg-navy font-medium">
                      <p><span className="text-dg-muted">Address:</span> {service.address || 'Unknown'}</p>
                      {service.phone && (
                        <p><span className="text-dg-muted">Phone:</span> {service.phone}</p>
                      )}
                      <p>
                        <span className="text-dg-muted">Status: </span>
                        {service.is_verified ? (
                          <span className="text-dg-success font-bold">Verified ✓</span>
                        ) : (
                          <span className="text-dg-warning font-bold">Unverified</span>
                        )}
                      </p>
                      <p><span className="text-dg-muted">Source:</span> <span className="uppercase text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded ml-1">{service.source_type}</span></p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-dg-border space-y-3">
                    {service.source_type === 'DEMO' && (
                      <p className="text-xs text-dg-danger font-bold">Demo Data — verify locally before relying on this information.</p>
                    )}
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleViewOnMap(service)}
                        disabled={!service.latitude || !service.longitude}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors border ${service.latitude && service.longitude ? 'bg-dg-bg hover:bg-slate-100 text-dg-navy border-dg-border' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                      >
                        View Map
                      </button>
                      {service.phone && (
                        <a href={`tel:${service.phone}`} className="flex-1 bg-danger hover:bg-red-600 text-white text-center py-2 rounded text-sm transition-colors font-bold">
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmergencyServices;

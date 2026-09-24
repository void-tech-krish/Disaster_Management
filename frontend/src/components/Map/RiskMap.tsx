import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, LayersControl, GeoJSON } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Location {
  id: number;
  name: string;
  lat: number;
  lon: number;
  risk_level?: string;
  hazard?: string;
  population?: number;
}

interface RiskMapProps {
  locations: Location[];
  activeFilter: string;
  showPopulation: boolean;
  cycloneData?: any;
}

const RiskMap: React.FC<RiskMapProps> = ({ locations, activeFilter, showPopulation, cycloneData }) => {
  const center: [number, number] = [20.5937, 78.9629];
  const status = useNetworkStatus();
  
  const [riskZones, setRiskZones] = useState<any>(null);
  const [warnings, setWarnings] = useState<any>(null);

  useEffect(() => {
    if (status === 'OFFLINE') return; // Do not fetch if offline

    api.get(`/map/risk-zones${activeFilter !== 'All' ? `?hazard=${activeFilter}` : ''}`)
      .then(res => setRiskZones(res.data.data))
      .catch(err => console.error("Failed to load risk zones", err));

    api.get('/map/warnings')
      .then(res => setWarnings(res.data.data))
      .catch(err => console.error("Failed to load warnings", err));
  }, [activeFilter, status]);

  const getRiskColor = (level?: string) => {
    if (level === 'CRITICAL') return '#ef4444';
    if (level === 'HIGH') return '#f97316';
    if (level === 'MODERATE') return '#facc15';
    return '#22c55e';
  };

  const filteredLocations = activeFilter === 'All' 
    ? locations 
    : locations.filter(l => l.hazard === activeFilter);

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-gray-700 shadow-xl relative">
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-darkslate/90 p-3 rounded-lg border border-gray-600 shadow-lg text-xs">
        <h4 className="font-bold mb-2 uppercase text-gray-400">Risk Zones</h4>
        <div className="space-y-1">
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-danger mr-2"></span> CRITICAL</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-warning mr-2"></span> HIGH</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span> MODERATE</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-success mr-2"></span> LOW</div>
          {(activeFilter === 'All' || activeFilter === 'Cyclone') && cycloneData && (
            <div className="flex items-center mt-2 border-t border-gray-600 pt-2"><span className="w-4 h-1 bg-blue-500 mr-2"></span> Historical Cyclone Track</div>
          )}
        </div>
      </div>

      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LayersControl position="topright">
          {riskZones && (
            <LayersControl.Overlay checked name="AI Risk Zones">
              <GeoJSON 
                data={riskZones} 
                style={(feature) => ({
                  color: getRiskColor(feature?.properties.risk_level),
                  weight: 2,
                  fillOpacity: 0.4
                })}
                onEachFeature={(feature, layer) => {
                  if (feature.properties) {
                    layer.bindPopup(`
                      <div class="text-xs">
                        <strong>${feature.properties.hazard_type} Risk</strong><br/>
                        Level: ${feature.properties.risk_level}<br/>
                        Score: ${feature.properties.risk_score}<br/>
                        <span class="text-blue-500 font-bold uppercase mt-1 inline-block">AI RISK ASSESSMENT</span><br/>
                        Freshness: ${status === 'OFFLINE' ? 'CACHED' : 'LIVE DATA'}
                      </div>
                    `);
                  }
                }}
              />
            </LayersControl.Overlay>
          )}

          {warnings && (
            <LayersControl.Overlay checked name="Official Warnings">
              <GeoJSON 
                data={warnings} 
                style={{ color: '#ef4444', weight: 3, dashArray: '5, 5', fillOpacity: 0.2 }}
                onEachFeature={(feature, layer) => {
                  if (feature.properties) {
                    layer.bindPopup(`
                      <div class="text-xs">
                        <strong>${feature.properties.title}</strong><br/>
                        ${feature.properties.message}<br/>
                        <span class="text-red-500 font-bold uppercase mt-1 inline-block">OFFICIAL WARNING</span><br/>
                        Expires: ${new Date(feature.properties.valid_until).toLocaleString()}
                      </div>
                    `);
                  }
                }}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
        
        {/* Render Cyclone Tracks */}
        {(activeFilter === 'All' || activeFilter === 'Cyclone') && cycloneData?.tracks?.map((track: any) => {
           const positions = track.points.map((p: any) => [p.lat, p.lon] as [number, number]);
           return (
             <React.Fragment key={track.cyclone_id}>
               <Polyline positions={positions} pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.8 }} />
               {track.points.map((p: any, idx: number) => (
                 <Circle 
                   key={`${track.cyclone_id}-${idx}`}
                   center={[p.lat, p.lon]} 
                   radius={30000} 
                   pathOptions={{ color: '#60a5fa', fillColor: '#93c5fd', fillOpacity: 0.2, weight: 1 }}
                 >
                   <Popup>
                     <div className="text-darkslate text-xs">
                        <strong>Cyclone {track.cyclone_id}</strong><br/>
                        Basin: {track.basin}<br/>
                        Time: {p.time}<br/>
                        Wind: {p.wind_speed} kt<br/>
                        Pressure: {p.pressure} mb<br/>
                        <span className="text-blue-500 font-bold uppercase mt-1 inline-block">Historical Track</span>
                     </div>
                   </Popup>
                 </Circle>
               ))}
             </React.Fragment>
           );
        })}

        {filteredLocations.map(loc => (
          <React.Fragment key={loc.id}>
            {loc.risk_level && (
              <Circle 
                center={[loc.lat, loc.lon]}
                radius={showPopulation ? (loc.population ? loc.population / 2 : 15000) : 15000}
                pathOptions={{ 
                  color: getRiskColor(loc.risk_level), 
                  fillColor: getRiskColor(loc.risk_level), 
                  fillOpacity: 0.4 
                }}
              />
            )}
            <Marker position={[loc.lat, loc.lon]}>
              <Popup>
                <div className="text-darkslate p-1 w-48">
                  <h3 className="font-bold text-lg mb-1">{loc.name}</h3>
                  <div className="text-sm space-y-1 mb-3">
                    <p>Hazard: <strong>{loc.hazard || 'Pending'}</strong></p>
                    <p>Status: <span className="font-semibold" style={{ color: getRiskColor(loc.risk_level) }}>{loc.risk_level || 'Pending'}</span></p>
                    {showPopulation && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <p className="text-xs text-danger font-bold uppercase tracking-wider">Population at Risk</p>
                        <p className="font-bold text-lg">{loc.population ? loc.population.toLocaleString() : '18,420'} <span className="text-[10px] text-gray-500 font-normal">ESTIMATE</span></p>
                      </div>
                    )}
                  </div>
                  <Link to={`/location/${loc.id}`} className="block text-center text-sm bg-charcoal text-white px-3 py-1.5 rounded hover:bg-gray-800 transition-colors">
                    View Profile &rarr;
                  </Link>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default RiskMap;

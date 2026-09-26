import React, { useEffect, useState, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl';
import type { FillLayer, LineLayer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

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

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const RiskMap: React.FC<RiskMapProps> = ({ locations, activeFilter, showPopulation }) => {
  const status = useNetworkStatus();
  
  const [riskZones, setRiskZones] = useState<any>(null);
  const [warnings, setWarnings] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (status === 'OFFLINE') return;

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

  const riskZoneStyle = useMemo<Omit<FillLayer, 'source'>>(() => ({
    id: 'risk-zones-layer',
    type: 'fill',
    paint: {
      'fill-color': ['match', ['get', 'risk_level'],
        'CRITICAL', '#ef4444',
        'HIGH', '#f97316',
        'MODERATE', '#facc15',
        '#22c55e'
      ],
      'fill-opacity': 0.4
    }
  }), []);

  const warningStyle = useMemo<Omit<LineLayer, 'source'>>(() => ({
    id: 'warnings-layer',
    type: 'line',
    paint: {
      'line-color': '#ef4444',
      'line-width': 3,
      'line-dasharray': [5, 5]
    }
  }), []);

  return (
    <div className="h-[600px] w-full rounded-[18px] overflow-hidden border border-dg-border shadow-sm relative">
      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-10 bg-dg-surface/90 p-4 rounded-xl border border-dg-border shadow-sm text-xs">
        <h4 className="font-bold mb-2 uppercase text-dg-muted tracking-wider">Risk Zones</h4>
        <div className="space-y-1 font-medium text-dg-navy">
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> CRITICAL</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span> HIGH</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span> MODERATE</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> LOW</div>
        </div>
      </div>

      <Map
        initialViewState={{
          longitude: 78.9629,
          latitude: 20.5937,
          zoom: 4
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {riskZones && (
          <Source id="risk-zones" type="geojson" data={riskZones}>
            <Layer {...riskZoneStyle} />
          </Source>
        )}

        {warnings && (
          <Source id="warnings" type="geojson" data={warnings}>
            <Layer {...warningStyle} />
          </Source>
        )}

        {filteredLocations.map(loc => (
          <Marker 
            key={loc.id} 
            longitude={loc.lon} 
            latitude={loc.lat} 
            color={getRiskColor(loc.risk_level)}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedLocation(loc);
            }}
          />
        ))}

        {selectedLocation && (
          <Popup
            longitude={selectedLocation.lon}
            latitude={selectedLocation.lat}
            anchor="bottom"
            onClose={() => setSelectedLocation(null)}
            closeOnClick={false}
          >
            <div className="p-2 w-48 font-sans">
              <h3 className="font-extrabold text-lg mb-1 text-dg-navy">{selectedLocation.name}</h3>
              <div className="text-sm space-y-1 mb-3 text-dg-navy">
                <p>Hazard: <strong>{selectedLocation.hazard || 'Pending'}</strong></p>
                <p>Status: <span className="font-bold" style={{ color: getRiskColor(selectedLocation.risk_level) }}>{selectedLocation.risk_level || 'Pending'}</span></p>
                {showPopulation && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-dg-danger font-bold uppercase tracking-wider">Population at Risk</p>
                    <p className="font-extrabold text-lg">{selectedLocation.population ? selectedLocation.population.toLocaleString() : '18,420'} <span className="text-[10px] text-dg-muted font-normal">ESTIMATE</span></p>
                  </div>
                )}
              </div>
              <Link to={`/location/${selectedLocation.id}`} className="block text-center text-sm font-bold bg-dg-bg text-dg-primary border border-dg-primary px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                View Profile &rarr;
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default RiskMap;

// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import EventTimeline from '../components/EventTimeline';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const IncidentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAuthorized = user && (user.role === 'Authority' || user.role === 'Admin');

  const [incident, setIncident] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthorized) {
      Promise.all([
        api.get(`/incidents/${id}`),
        api.get(`/incidents/${id}/timeline`)
      ]).then(([incRes, timeRes]) => {
        setIncident(incRes.data.data.incident);
        setTimeline(timeRes.data.data.timeline);
      }).catch(err => {
        console.error(err);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isAuthorized]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-gray-400">Loading Incident Details...</div>;
  
  if (!isAuthorized) return (
    <div className="bg-danger/20 border border-danger text-danger p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-lg">
      <h2 className="text-2xl font-bold mb-2">403 Forbidden</h2>
      <p>Access Denied: Authority credentials required.</p>
    </div>
  );

  if (!incident) return <div className="p-8 text-gray-400">Incident not found.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 printable-area">
      {/* Header */}
      <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs font-mono">{incident.incident_code}</span>
            <span className={`px-2 py-1 border rounded text-xs font-bold ${incident.status === 'CLOSED' ? 'border-success text-success' : 'border-warning text-warning'}`}>
              {incident.status}
            </span>
            <span className={`px-2 py-1 rounded text-[10px] font-bold ${incident.severity === 'CRITICAL' ? 'bg-danger text-white' : 'bg-warning text-darkslate'}`}>
              {incident.severity}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{incident.title}</h1>
          <p className="text-gray-400 mt-1">{incident.hazard_type} • Reported: {new Date(incident.reported_at).toLocaleString()}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <button onClick={handlePrint} className="bg-info text-darkslate px-4 py-2 rounded font-bold text-sm shadow">
            Export Report (PDF)
          </button>
          <span className="text-[10px] text-gray-500 text-right uppercase font-bold">Data Status: {incident.source_type}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Impact, Map, Analysis */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Impact Analysis */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-bold border-b border-gray-700 pb-2 mb-4 text-warning">Impact Analysis</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-charcoal p-4 rounded border border-gray-600">
                <p className="text-xs text-gray-400 uppercase">Affected Pop.</p>
                <p className="text-2xl font-bold text-white">{incident.affected_population?.toLocaleString() || '--'}</p>
                <p className="text-[10px] text-info mt-1 font-bold">ESTIMATED</p>
              </div>
              <div className="bg-charcoal p-4 rounded border border-gray-600">
                <p className="text-xs text-gray-400 uppercase">Fatalities</p>
                <p className="text-2xl font-bold text-danger">{incident.fatality_count || '--'}</p>
                <p className="text-[10px] text-gray-500 mt-1">CONFIRMED</p>
              </div>
              <div className="bg-charcoal p-4 rounded border border-gray-600">
                <p className="text-xs text-gray-400 uppercase">Resources Used</p>
                <p className="text-2xl font-bold text-white">{incident.resources_deployed || '--'}</p>
                <p className="text-[10px] text-info mt-1 font-bold">LOGGED</p>
              </div>
              <div className="bg-charcoal p-4 rounded border border-gray-600">
                <p className="text-xs text-gray-400 uppercase">Est. Damage</p>
                <p className="text-2xl font-bold text-warning">{incident.estimated_damage ? `${incident.damage_currency} ${incident.estimated_damage}` : '--'}</p>
                <p className="text-[10px] text-gray-500 mt-1">USER-REPORTED</p>
              </div>
            </div>
            {incident.description && (
              <div className="mt-4 p-4 bg-charcoal rounded border border-gray-700">
                <h3 className="text-sm font-bold text-gray-400 mb-1">Incident Description</h3>
                <p className="text-sm text-gray-300">{incident.description}</p>
              </div>
            )}
          </div>

          {/* Incident Map */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg h-[400px] flex flex-col">
            <h2 className="text-xl font-bold border-b border-gray-700 pb-2 mb-4 text-warning">Incident Location & Topology</h2>
            <div className="flex-1 rounded border border-gray-600 overflow-hidden relative">
              {(incident.latitude && incident.longitude) ? (
                <MapContainer center={[incident.latitude, incident.longitude]} zoom={11} style={{ height: '100%', width: '100%', background: '#1f2937' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <Circle center={[incident.latitude, incident.longitude]} radius={5000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} />
                  <Marker position={[incident.latitude, incident.longitude]}>
                    <Popup><span className="text-black font-bold">Ground Zero</span></Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm bg-charcoal">
                  NO SPATIAL DATA AVAILABLE FOR THIS INCIDENT
                </div>
              )}
            </div>
          </div>
          
          {/* Lessons Learned */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
              <h2 className="text-xl font-bold text-warning">Lessons Learned</h2>
              <button className="text-info text-sm hover:underline font-bold">+ Add Observation</button>
            </div>
            <div className="text-center p-8 bg-charcoal border border-gray-600 rounded border-dashed">
              <p className="text-gray-400 text-sm">No lessons or post-action observations recorded yet.</p>
              <p className="text-[10px] text-gray-500 mt-2">Authority action required to populate.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Meta */}
        <div className="space-y-6">
          
          {/* Timeline */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4 flex justify-between">
              <span>Event Timeline</span>
              <button className="text-info text-xs font-normal hover:underline">+ Add Event</button>
            </h2>
            <div className="max-h-[500px] overflow-y-auto pr-2">
              <EventTimeline events={timeline.length ? timeline : [{ id: 0, title: 'Incident Created', timestamp: incident.created_at }]} />
            </div>
          </div>

          {/* Response Performance Metrics */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">Response Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
                <span className="text-gray-400">Response Started</span>
                <span className="font-mono text-white">{incident.response_start_time ? new Date(incident.response_start_time).toLocaleTimeString() : 'NOT AVAILABLE'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
                <span className="text-gray-400">Response Ended</span>
                <span className="font-mono text-white">{incident.response_end_time ? new Date(incident.response_end_time).toLocaleTimeString() : 'NOT AVAILABLE'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Response Duration</span>
                <span className="font-mono text-info font-bold">
                  {incident.response_start_time && incident.response_end_time 
                    ? `${Math.round((new Date(incident.response_end_time).getTime() - new Date(incident.response_start_time).getTime()) / 60000)} mins` 
                    : '--'}
                </span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default IncidentDetails;

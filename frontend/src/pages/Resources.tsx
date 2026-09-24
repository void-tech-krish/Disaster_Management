// @ts-nocheck
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Resources = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAuthority = user && (user.role === 'Authority' || user.role === 'Admin');
  
  const [resources, setResources] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [shortages, setShortages] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    resource_type: 'AMBULANCE',
    name: '',
    quantity: 1,
    unit: 'vehicles',
    latitude: 16.5,
    longitude: 80.64,
    organization: '',
    priority: 'NORMAL'
  });
  
  const [assignData, setAssignData] = useState({
    assigned_quantity: 1,
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const resRes = await api.get('/resources' + (filterType ? `?resource_type=${filterType}` : ''));
      setResources(resRes.data.data.resources);

      if (isAuthority) {
        const shortRes = await api.get('/resources/shortages');
        setShortages(shortRes.data.data.shortages || []);
        
        const recRes = await api.get('/resources/recommendations?risk_level=CRITICAL&population=15000&latitude=16.5&longitude=80.64');
        setRecommendations(recRes.data.data.recommendations || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/resources', formData);
      toast.success('Resource created successfully');
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to create resource');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/resources/${selectedResource.id}/assign`, assignData);
      toast.success('Resource assigned successfully');
      setShowAssignModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  // Metrics
  const total = resources.length;
  const available = resources.filter(r => r.status === 'AVAILABLE').length;
  const deployed = resources.filter(r => r.status === 'DEPLOYED' || r.status === 'ASSIGNED').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2">
        <h1 className="text-3xl font-bold text-warning">{t('resources.resourceManagement')}</h1>
        {isAuthority && (
          <button onClick={() => setShowAddModal(true)} className="bg-warning text-darkslate px-4 py-2 rounded font-bold hover:bg-yellow-500">
            {t('resources.addResourceBtn')}
          </button>
        )}
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-darkslate p-4 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">{t('resources.totalResources')}</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-darkslate p-4 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">{t('resources.available')}</p>
          <p className="text-2xl font-bold text-success">{available}</p>
        </div>
        <div className="bg-darkslate p-4 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">{t('resources.deployed')}</p>
          <p className="text-2xl font-bold text-warning">{deployed}</p>
        </div>
        <div className="bg-danger/10 p-4 rounded-xl border border-danger text-center">
          <p className="text-danger text-sm">{t('resources.criticalShortages')}</p>
          <p className="text-2xl font-bold text-danger">{shortages.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <div className="bg-darkslate rounded-xl border border-gray-700 h-[400px] overflow-hidden">
             <MapContainer center={[16.5062, 80.6480]} zoom={11} style={{ height: '100%', width: '100%', background: '#1f2937' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {resources.map(r => r.latitude && r.longitude && (
                  <Marker key={r.id} position={[r.latitude, r.longitude]}>
                    <Popup>
                      <div className="text-darkslate font-bold p-1">
                        <p className="text-lg">{r.name}</p>
                        <p>{t('resources.type')}: {r.resource_type}</p>
                        <p>{t('resources.available')}: {r.available_quantity} / {r.quantity}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
             </MapContainer>
          </div>

          {/* Table */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Operational Resources</h2>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-charcoal border border-gray-600 rounded px-2 py-1 text-sm">
                <option value="">All Types</option>
                <option value="AMBULANCE">Ambulance</option>
                <option value="RESCUE_TEAM">Rescue Team</option>
                <option value="WATER">Water</option>
                <option value="MEDICAL_KIT">Medical Kit</option>
              </select>
            </div>
            {loading ? <p>Loading...</p> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-600 text-gray-400">
                    <th className="p-2">{t('resources.resourceName')}</th>
                    <th className="p-2">{t('resources.available')}</th>
                    <th className="p-2">Status</th>
                    {isAuthority && <th className="p-2">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {resources.map(r => (
                    <tr key={r.id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-2">
                        <p className="font-bold">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.resource_type}</p>
                      </td>
                      <td className="p-2">{r.available_quantity} {r.unit}</td>
                      <td className="p-2">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${r.status === 'AVAILABLE' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                          {r.status}
                        </span>
                      </td>
                      {isAuthority && (
                        <td className="p-2">
                          <button 
                            disabled={r.status !== 'AVAILABLE' && r.available_quantity === 0}
                            onClick={() => { setSelectedResource(r); setShowAssignModal(true); }}
                            className="bg-info text-darkslate text-xs px-3 py-1 rounded font-bold hover:bg-blue-400 disabled:opacity-50"
                          >
                            {t('actions.assign')}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* AI Recommendations Panel */}
        {isAuthority && (
          <div className="space-y-6">
            <div className="bg-info/10 p-6 rounded-xl border border-info">
              <h2 className="text-xl font-bold mb-4 text-info">{t('resources.aiAssistedAllocation')}</h2>
              <p className="text-sm text-gray-300 mb-4">CRITICAL RISK | Pop: 15,000</p>
              <div className="space-y-4">
                {recommendations.map((r, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-darkslate rounded border border-info/30">
                    <div>
                      <span className="font-bold block">{r.resource_type}</span>
                      <span className="text-xs text-gray-400">Shortage: {r.shortage}</span>
                    </div>
                    <span className="bg-info text-darkslate px-3 py-1 rounded font-bold text-sm">Deploy {r.recommended_quantity}</span>
                  </div>
                ))}
                <p className="text-xs text-center text-gray-400">Decision-support recommendation, not automatic deployment.</p>
              </div>
            </div>

            {shortages.length > 0 && (
              <div className="bg-danger/10 p-6 rounded-xl border border-danger">
                <h2 className="text-xl font-bold mb-4 text-danger">Active Shortages</h2>
                <div className="space-y-3">
                  {shortages.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm bg-darkslate p-2 rounded border border-danger/30">
                      <span className="font-bold">{s.resource_type}</span>
                      <span className="text-danger">Need {s.shortage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-darkslate p-6 rounded-xl border border-gray-600 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Resource</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select value={formData.resource_type} onChange={e => setFormData({...formData, resource_type: e.target.value})} className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white">
                    <option value="AMBULANCE">Ambulance</option>
                    <option value="RESCUE_TEAM">Rescue Team</option>
                    <option value="WATER">Water</option>
                    <option value="FOOD">Food</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                  <input type="number" min="1" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-warning text-darkslate px-4 py-2 rounded font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-darkslate p-6 rounded-xl border border-gray-600 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign {selectedResource.name}</h2>
            <p className="text-sm text-gray-400 mb-4">Available: {selectedResource.available_quantity}</p>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Quantity to Assign</label>
                <input type="number" min="1" max={selectedResource.available_quantity} required value={assignData.assigned_quantity} onChange={e => setAssignData({...assignData, assigned_quantity: parseInt(e.target.value)})} className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes / Location</label>
                <input required value={assignData.notes} onChange={e => setAssignData({...assignData, notes: e.target.value})} className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-info text-darkslate px-4 py-2 rounded font-bold">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;

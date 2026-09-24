import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  'FLOOD', 'FLASH_FLOOD', 'LANDSLIDE', 'CYCLONE_DAMAGE', 'HEAVY_RAIN', 
  'LIGHTNING', 'FIRE', 'ROAD_BLOCKAGE', 'BRIDGE_DAMAGE', 'BUILDING_DAMAGE',
  'POWER_OUTAGE', 'WATER_DISRUPTION', 'TELECOM_DISRUPTION', 'SHELTER_ISSUE',
  'MEDICAL_EMERGENCY', 'MISSING_PERSON', 'INFRASTRUCTURE_DAMAGE', 'OTHER'
];

const SEVERITIES = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'UNKNOWN'];

const CitizenReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: 'FLOOD',
    title: '',
    description: '',
    severity: 'UNKNOWN',
    latitude: '' as number | '',
    longitude: '' as number | '',
    addressText: '',
    isPublic: true
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationDetect = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({ ...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setIsLocating(false);
          toast.success("Location detected.");
        },
        () => {
          toast.error("Failed to detect location. Please enter manually.");
          setIsLocating(false);
        }
      );
    } else {
      toast.error("Geolocation not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a report.");
      navigate('/login');
      return;
    }

    if (formData.severity === 'CRITICAL' || formData.category === 'MEDICAL_EMERGENCY') {
      toast("Reminder: This system does not replace emergency services. Please contact 911/112 if in immediate danger.", { icon: '🚨', duration: 6000 });
    }

    setIsSubmitting(true);
    try {
      await api.post('/community-reports', formData);
      toast.success("Report submitted successfully.");
      navigate('/my-reports');
    } catch (err) {
      // Offline fallback handling could go here
      toast.error("Failed to submit report. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-white">Report a Disaster Situation</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Your report helps authorities understand the situation on the ground. <br/>
          <strong className="text-danger">This form does not dispatch emergency services. Call local emergency numbers if in immediate danger.</strong>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-darkslate border border-gray-700 p-6 rounded-xl shadow-lg space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Observation Category *</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-charcoal border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-info"
              required
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Severity (Your Estimate) *</label>
            <select 
              value={formData.severity}
              onChange={e => setFormData({...formData, severity: e.target.value})}
              className="w-full bg-charcoal border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-info"
              required
            >
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">Title *</label>
          <input 
            type="text" 
            placeholder="E.g., Road flooded near Main St bridge"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-charcoal border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-info"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">Description *</label>
          <textarea 
            placeholder="Provide details: What did you observe? What is affected? Is the road blocked?"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-charcoal border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-info h-32"
            required
          />
        </div>

        <div className="border border-gray-700 rounded-lg p-4 bg-charcoal/50">
          <h3 className="font-bold text-white mb-4">Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Latitude</label>
              <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} className="w-full bg-darkslate border border-gray-600 rounded px-3 py-1.5 text-sm" placeholder="e.g. 16.5062" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Longitude</label>
              <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} className="w-full bg-darkslate border border-gray-600 rounded px-3 py-1.5 text-sm" placeholder="e.g. 80.6480" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 mb-1">Address / Landmark</label>
            <input type="text" value={formData.addressText} onChange={e => setFormData({...formData, addressText: e.target.value})} className="w-full bg-darkslate border border-gray-600 rounded px-3 py-1.5 text-sm" placeholder="Nearest landmark or street" />
          </div>

          <button type="button" onClick={handleLocationDetect} disabled={isLocating} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors flex items-center">
            {isLocating ? 'Detecting...' : '📍 Use Current Location'}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="isPublic" checked={formData.isPublic} onChange={e => setFormData({...formData, isPublic: e.target.checked})} className="rounded bg-charcoal border-gray-600 text-info focus:ring-info h-4 w-4" />
          <label htmlFor="isPublic" className="text-sm text-gray-300">Allow anonymous publication on Public Transparency Map (Approximate location used)</label>
        </div>

        <div className="pt-4 border-t border-gray-700 flex justify-end space-x-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 rounded text-gray-300 hover:bg-gray-800 transition-colors font-bold">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="bg-info hover:bg-blue-500 text-darkslate px-8 py-2 rounded font-bold transition-colors">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CitizenReport;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const EvacuationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advisory, setAdvisory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvisory();
  }, [id]);

  const fetchAdvisory = async () => {
    try {
      const res = await api.get(`/evacuation/${id}`);
      setAdvisory(res.data.data);
    } catch (err) {
      toast.error('Failed to load advisory details.');
      navigate('/authority/evacuation');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    try {
      await api.patch(`/evacuation/${id}/${action}`, { note: `Authority manual ${action} action.` });
      toast.success(`Advisory successfully ${action}d`);
      fetchAdvisory();
    } catch (err) {
      toast.error(`Failed to ${action} advisory`);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading Advisory...</div>;
  if (!advisory) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm flex items-center mb-4">
        &larr; Back to Queue
      </button>

      <div className="bg-darkslate border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
        <header className="p-6 border-b border-gray-700 flex justify-between items-start bg-charcoal/50">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm font-mono text-gray-400 bg-black/50 px-2 py-1 rounded">{advisory.advisory_code}</span>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded ${
                advisory.status === 'PENDING_REVIEW' ? 'bg-warning/20 text-warning border border-warning' :
                advisory.status === 'APPROVED' ? 'bg-info/20 text-info border border-info' :
                advisory.status === 'ACTIVE' ? 'bg-success/20 text-success border border-success' :
                'bg-gray-700 text-gray-300'
              }`}>
                {advisory.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">{advisory.title}</h1>
            <p className="text-gray-400 mt-2">{advisory.description}</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400 uppercase font-bold mb-1">Source</div>
            <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded text-xs border border-gray-600">
              {advisory.source_type}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-700">
          
          {/* Main Info */}
          <div className="p-6 lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-white mb-3">Decision Support Reasoning</h3>
              <div className="bg-black/30 rounded p-4 border-l-4 border-info">
                <p className="text-sm text-gray-300 mb-2 whitespace-pre-wrap">{advisory.reason}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-charcoal p-4 rounded border border-gray-700">
                <h4 className="text-xs text-gray-400 uppercase font-bold mb-1">Population at Risk</h4>
                <p className="text-xl font-bold text-danger">{advisory.population_at_risk}</p>
              </div>
              <div className="bg-charcoal p-4 rounded border border-gray-700">
                <h4 className="text-xs text-gray-400 uppercase font-bold mb-1">Shelter Capacity Required</h4>
                <p className="text-xl font-bold text-warning">{advisory.shelter_required}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg text-white mb-3">Lower-Risk Route Assessment</h3>
              <div className="bg-charcoal border border-gray-600 rounded p-4 text-sm text-gray-300">
                <p className="mb-2"><strong>Primary Route:</strong> Main Hwy to Zone 4 Shelter</p>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-400">Segment 1 (0-2km):</span> <span className="text-success font-bold text-xs">LOW EXPOSURE</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-400">Segment 2 (2-3km):</span> <span className="text-warning font-bold text-xs">MODERATE (Close to flood plain)</span></div>
                </div>
                <p className="mt-4 text-xs text-info bg-info/10 p-2 rounded">
                  ⚠️ <strong>Important:</strong> AI assessment provides decision support only. Routes cannot be guaranteed 100% safe.
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Actions */}
          <div className="p-6 bg-charcoal/30">
            <h3 className="font-bold text-lg text-white mb-4">Authority Workflow</h3>
            
            <div className="space-y-3">
              {advisory.status === 'PENDING_REVIEW' && (
                <>
                  <button onClick={() => handleAction('approve')} className="w-full bg-info text-darkslate font-bold py-2 px-4 rounded hover:bg-blue-400 transition">
                    Approve Advisory
                  </button>
                  <button onClick={() => handleAction('reject')} className="w-full bg-danger text-white font-bold py-2 px-4 rounded hover:bg-red-500 transition">
                    Reject
                  </button>
                </>
              )}
              
              {advisory.status === 'APPROVED' && (
                <button onClick={() => handleAction('activate')} className="w-full bg-success text-darkslate font-bold py-2 px-4 rounded hover:bg-green-500 transition">
                  Activate & Notify Public
                </button>
              )}

              {advisory.status === 'ACTIVE' && (
                <button onClick={() => handleAction('complete')} className="w-full bg-charcoal border border-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition">
                  Mark Evacuation Complete
                </button>
              )}
            </div>

            <div className="mt-8">
              <h4 className="text-xs text-gray-400 uppercase font-bold mb-2">Data Freshness</h4>
              <div className="flex items-center text-sm">
                <span className={`w-2 h-2 rounded-full mr-2 ${advisory.data_freshness === 'FRESH' ? 'bg-success' : 'bg-warning'}`}></span>
                <span className="text-gray-300">{advisory.data_freshness}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EvacuationDetails;

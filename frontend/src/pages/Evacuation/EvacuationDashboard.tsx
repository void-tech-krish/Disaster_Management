import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const EvacuationDashboard = () => {
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvisories();
  }, []);

  const fetchAdvisories = async () => {
    try {
      const res = await api.get('/evacuation');
      setAdvisories(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load evacuation advisories.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading Evacuation Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="border-b border-gray-700 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <span className="mr-3">🚶</span> Evacuation & Shelter Coordination
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Decision support system for safe movement planning.
          </p>
        </div>
        <div className="space-x-4">
          <Link to="/evacuation-simulator" className="bg-charcoal border border-gray-600 text-gray-300 px-4 py-2 rounded text-sm font-bold shadow hover:bg-gray-700 transition-colors">
            Run Evacuation Simulator
          </Link>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-darkslate border border-gray-700 p-4 rounded-xl">
          <h3 className="text-xs text-gray-400 font-bold uppercase mb-1">Total Advisories</h3>
          <p className="text-2xl font-bold">{advisories.length}</p>
        </div>
        <div className="bg-darkslate border border-warning/50 p-4 rounded-xl">
          <h3 className="text-xs text-warning font-bold uppercase mb-1">Pending Review</h3>
          <p className="text-2xl font-bold text-warning">{advisories.filter(a => a.status === 'PENDING_REVIEW').length}</p>
        </div>
        <div className="bg-darkslate border border-success/50 p-4 rounded-xl">
          <h3 className="text-xs text-success font-bold uppercase mb-1">Active Evacuations</h3>
          <p className="text-2xl font-bold text-success">{advisories.filter(a => a.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-darkslate border border-danger/50 p-4 rounded-xl">
          <h3 className="text-xs text-danger font-bold uppercase mb-1">Pop. At Risk (Active)</h3>
          <p className="text-2xl font-bold text-danger">
            {advisories.filter(a => a.status === 'ACTIVE').reduce((sum, a) => sum + (a.population_at_risk || 0), 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {advisories.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-darkslate rounded-xl border border-gray-700">
            No active or pending evacuation advisories.
          </div>
        ) : (
          advisories.map(adv => (
            <div key={adv.id} className="bg-darkslate border border-gray-700 p-5 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-mono bg-charcoal text-gray-400 px-2 py-1 rounded">{adv.advisory_code}</span>
                  <span className="text-xs font-bold bg-gray-700 text-white px-2 py-1 rounded uppercase">{adv.hazard_type}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                    adv.status === 'PENDING_REVIEW' ? 'bg-warning/20 text-warning border border-warning' :
                    adv.status === 'ACTIVE' ? 'bg-success/20 text-success border border-success' :
                    adv.status === 'COMPLETED' ? 'bg-info/20 text-info border border-info' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {adv.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{adv.title}</h3>
                <div className="text-xs text-gray-400 mt-2 space-x-4 flex">
                  <span><strong className="text-gray-300">Population at Risk:</strong> {adv.population_at_risk}</span>
                  <span><strong className="text-gray-300">Shelter Req:</strong> {adv.shelter_required}</span>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex gap-2 w-full md:w-auto">
                <Link to={`/authority/evacuation/${adv.id}`} className="w-full md:w-auto bg-info text-darkslate px-4 py-2 rounded text-sm font-bold text-center hover:bg-blue-400 transition-colors">
                  View Details & Workflow
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EvacuationDashboard;

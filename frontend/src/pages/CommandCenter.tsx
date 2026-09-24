import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, Map, Users, Truck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommandCenter() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/command-center/summary');
        setSummary(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load command center summary');
      }
    };
    fetchSummary();
  }, []);

  if (!summary) return <div className="p-6">Loading command center...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Unified Disaster Command Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-red-900 bg-opacity-30 p-4 rounded-xl border border-red-500 shadow flex flex-col items-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-sm font-semibold text-gray-300">Active Incidents</div>
            <div className="text-3xl font-bold text-red-400">{summary.activeIncidents}</div>
        </div>
        
        <div className="bg-orange-900 bg-opacity-30 p-4 rounded-xl border border-orange-500 shadow flex flex-col items-center">
            <ShieldAlert className="h-8 w-8 text-orange-500 mb-2" />
            <div className="text-sm font-semibold text-gray-300">Active Alerts</div>
            <div className="text-3xl font-bold text-orange-400">{summary.activeAlerts}</div>
        </div>
        
        <div className="bg-yellow-900 bg-opacity-30 p-4 rounded-xl border border-yellow-500 shadow flex flex-col items-center">
            <Map className="h-8 w-8 text-yellow-500 mb-2" />
            <div className="text-sm font-semibold text-gray-300">Critical Risk Areas</div>
            <div className="text-3xl font-bold text-yellow-400">{summary.criticalRiskLocations}</div>
        </div>
        
        <div className="bg-green-900 bg-opacity-30 p-4 rounded-xl border border-green-500 shadow flex flex-col items-center">
            <Users className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-sm font-semibold text-gray-300">Open Shelters</div>
            <div className="text-3xl font-bold text-green-400">{summary.openShelters}</div>
        </div>
        
        <div className="bg-blue-900 bg-opacity-30 p-4 rounded-xl border border-blue-500 shadow flex flex-col items-center">
            <Truck className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-sm font-semibold text-gray-300">Pending Logistics</div>
            <div className="text-3xl font-bold text-blue-400">{summary.pendingLogisticsRequests}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Operational Status</h2>
            <p className="text-gray-300 mb-4">Current operational state based on aggregated multi-hazard data.</p>
            <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 p-4 rounded text-center">
                <span className="text-2xl font-black text-yellow-500 tracking-widest">ELEVATED</span>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">* Operational summary only. Not an official government declaration.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Decision Support</h2>
            <p className="text-gray-300 mb-4">Review system recommendations below.</p>
            
            {summary.pendingLogisticsRequests > 0 ? (
                <div className="bg-blue-900 bg-opacity-20 border border-blue-700 p-4 rounded mb-2">
                    <span className="font-bold text-blue-400">POTENTIAL SHORTAGE</span>
                    <p className="text-sm text-gray-400">There are {summary.pendingLogisticsRequests} pending logistics requests requiring authority review.</p>
                </div>
            ) : (
                 <div className="bg-gray-700 p-4 rounded mb-2">
                    <span className="text-gray-400">No active logistics gaps detected.</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

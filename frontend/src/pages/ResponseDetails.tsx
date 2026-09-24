import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';

const ResponseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchIntelligence = async () => {
    try {
      const res = await api.get(`/response-intelligence/${id}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'Authority' || user.role === 'Admin')) {
      fetchIntelligence();
      socket.on('response:approval-updated', fetchIntelligence);
      return () => {
        socket.off('response:approval-updated', fetchIntelligence);
      };
    } else {
      setLoading(false);
    }
  }, [id, user]);

  const handleApprove = async (recId: number) => {
    try {
      await api.post(`/response-intelligence/${id}/recommendations/${recId}/approve`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (recId: number) => {
    try {
      await api.post(`/response-intelligence/${id}/recommendations/${recId}/reject`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading Response Intelligence...</div>;
  if (!user || (user.role !== 'Authority' && user.role !== 'Admin')) {
    return <div className="p-8 text-danger">403 Forbidden</div>;
  }
  if (!data) return <div className="p-8 text-gray-400">Response case data unavailable.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <header className="border-b border-gray-700 pb-4 flex justify-between items-end">
        <div>
          <Link to="/authority" className="text-info hover:underline text-sm mb-2 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
            Response Case #{id}
            <span className="ml-4 text-xs bg-info text-darkslate px-2 py-1 rounded font-bold uppercase">{data.responseStatus}</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Context & Gaps */}
        <div className="space-y-6">
          {/* Response Attention Indicator */}
          <div className="bg-darkslate p-6 rounded-xl border border-danger shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-danger"></div>
            <h2 className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-2">Response Attention</h2>
            <div className="text-4xl font-black text-danger mb-4">{data.riskContext.level}</div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-bold mb-1">FACTORS:</p>
              {data.riskContext.factors.map((f: string, i: number) => (
                <div key={i} className="text-sm text-gray-300 flex items-center">
                  <span className="text-danger mr-2">▪</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Impact Overview */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="font-bold mb-4 border-b border-gray-700 pb-2">Spatial Impact Overview</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Population at Risk:</span>
                <span className="font-bold text-warning">{data.impact.populationAtRisk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nearest Shelter:</span>
                <span className="font-bold">{data.impact.nearestShelterDistance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shelter Capacity:</span>
                <span className="font-bold text-danger">{data.impact.shelterCapacity}</span>
              </div>
            </div>
          </div>

          {/* Information Gaps */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="font-bold mb-4 flex items-center text-warning">
              <span className="mr-2">⚠️</span> Information Gaps
            </h2>
            <p className="text-xs text-gray-400 mb-4">The following data points are unknown or stale.</p>
            <div className="space-y-3">
              {data.informationGaps.map((gap: any, i: number) => (
                <div key={i} className="bg-charcoal p-3 rounded border border-gray-600 text-sm">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold mr-2 ${gap.severity === 'HIGH' ? 'bg-danger text-white' : 'bg-warning text-darkslate'}`}>
                    {gap.type}
                  </span>
                  <span className="text-gray-300">{gap.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Column: Decision Support */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Approval Queue / Options */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-info">Recommended Actions (Decision Queue)</h2>
            <p className="text-sm text-gray-400 mb-6">Review the AI-generated operational recommendations below. You must explicitly approve actions to execute them.</p>
            
            <div className="space-y-4">
              {data.recommendations.map((rec: any) => (
                <div key={rec.id} className="bg-charcoal border border-gray-600 rounded p-4 relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold mr-2 bg-gray-700 text-gray-300`}>
                        {rec.type}
                      </span>
                      {rec.priority === 'CRITICAL' && <span className="text-[10px] px-2 py-0.5 rounded font-bold mr-2 bg-danger text-white">CRITICAL</span>}
                      <h3 className="font-bold inline-block text-lg">{rec.title}</h3>
                    </div>
                    {rec.status === 'PENDING_APPROVAL' ? (
                      <div className="flex space-x-2">
                        <button onClick={() => handleApprove(rec.id)} className="bg-success text-darkslate text-xs font-bold px-3 py-1.5 rounded hover:bg-green-500 shadow transition-colors">Approve</button>
                        <button onClick={() => handleReject(rec.id)} className="bg-danger text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-red-600 shadow transition-colors">Reject</button>
                      </div>
                    ) : (
                      <span className={`text-xs font-bold px-2 py-1 rounded ${rec.status === 'APPROVED' ? 'text-success border border-success' : 'text-danger border border-danger'}`}>
                        {rec.status}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
                  
                  <div className="bg-darkslate p-3 rounded text-xs border border-gray-700">
                    <span className="text-gray-500 font-bold block mb-1">REASONING:</span>
                    <span className="text-gray-300">{rec.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Gap Analysis */}
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="font-bold mb-4">Resource Gap Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.resourceGaps.map((rg: any, i: number) => (
                <div key={i} className="bg-charcoal p-4 rounded border border-gray-600">
                  <h3 className="font-bold text-sm text-white mb-3">{rg.resource}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Required:</span> <span className="text-white font-bold">{rg.required}</span></div>
                    <div><span className="text-gray-500">Available:</span> <span className="text-white font-bold">{rg.available}</span></div>
                    <div><span className="text-gray-500">Assigned:</span> <span className="text-info font-bold">{rg.assigned}</span></div>
                    <div><span className="text-gray-500">Gap:</span> <span className="text-danger font-bold">{rg.remaining}</span></div>
                  </div>
                  <div className="mt-3 text-[10px] text-gray-500 text-right uppercase">Source: {rg.source}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResponseDetails;

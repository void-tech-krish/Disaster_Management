import { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const RecoveryDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [damage, setDamage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const incidentId = 1; // Assuming demo incident 1

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, tasksRes, damageRes] = await Promise.all([
          api.get(`/recovery/${incidentId}/dashboard`).catch(() => ({ data: { data: null } })),
          api.get(`/recovery/${incidentId}/tasks`).catch(() => ({ data: { data: [] } })),
          api.get(`/recovery/${incidentId}/damage`).catch(() => ({ data: { data: [] } }))
        ]);
        
        setData(dashRes.data?.data || {
          status: 'RECOVERING',
          openTasks: 0,
          tasksInProgress: 0,
          blockedTasks: 0,
          completedTasks: 0,
          infrastructureUnderInspection: 0,
          sheltersUnderRepair: 0,
          populationAffected: 0,
          servicesRestored: 0,
          informationGaps: []
        });
        setTasks(tasksRes.data?.data || []);
        setDamage(damageRes.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch recovery data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [incidentId]);

  if (loading) return <div className="text-gray-400 p-6">Loading Recovery Workspace...</div>;

  const chartData = [
    { name: 'Pending', count: tasks.filter(t => t.status === 'PENDING').length },
    { name: 'In Progress', count: tasks.filter(t => t.status === 'IN_PROGRESS').length },
    { name: 'Completed', count: tasks.filter(t => t.status === 'COMPLETED').length }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <span className="mr-3">🏗️</span> Post-Disaster Recovery & Planning
          </h1>
          <p className="text-gray-400 mt-1">Incident: DEMO FLOOD EVENT (ID: {incidentId})</p>
        </div>
        <div className="text-right">
          <span className="bg-info text-darkslate px-3 py-1 rounded font-bold text-sm">
            {data?.status}
          </span>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">AI-Assisted Decision Support</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-darkslate border border-gray-700 rounded-lg p-4">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Open Tasks</h3>
          <p className="text-2xl font-bold text-white">{data?.openTasks}</p>
        </div>
        <div className="bg-darkslate border border-gray-700 rounded-lg p-4">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Infra Under Inspection</h3>
          <p className="text-2xl font-bold text-warning">{data?.infrastructureUnderInspection}</p>
        </div>
        <div className="bg-darkslate border border-gray-700 rounded-lg p-4">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Pop. Affected (Est.)</h3>
          <p className="text-2xl font-bold text-red-400">{data?.populationAffected}</p>
        </div>
        <div className="bg-darkslate border border-gray-700 rounded-lg p-4">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Services Restored</h3>
          <p className="text-2xl font-bold text-success">{data?.servicesRestored}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tasks & Gaps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recovery Tasks */}
          <div className="bg-darkslate border border-gray-700 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recovery Task Queue</h2>
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">Authority Approval Required</span>
            </div>
            
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-sm">No tasks assigned.</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="bg-charcoal border border-gray-600 rounded p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-danger text-white' : 'bg-gray-700 text-gray-300'}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-info font-bold">{task.task_type}</span>
                      </div>
                      <h4 className="font-bold text-gray-200">{task.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">Status: <span className="font-semibold text-white">{task.status}</span></p>
                    </div>
                    <div>
                      {task.status !== 'COMPLETED' && (
                        <button className="bg-info hover:bg-blue-600 text-darkslate px-3 py-1 rounded text-xs font-bold transition-colors">
                          Manage Task
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-darkslate border border-gray-700 rounded-xl p-6 shadow-xl h-80">
            <h2 className="text-lg font-bold mb-4">Task Completion Trends</h2>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip wrapperClassName="bg-charcoal border-gray-600 text-white" />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Right Column: Damage & Status */}
        <div className="space-y-6">
          
          {/* Information Gaps */}
          {data?.informationGaps?.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5">
              <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center">
                <span className="mr-2">⚠️</span> Information Gaps
              </h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                {data.informationGaps.map((gap: string, i: number) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Damage Assessment */}
          <div className="bg-darkslate border border-gray-700 rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Damage Assessments</h2>
            <div className="space-y-4">
              {damage.length === 0 ? (
                <p className="text-gray-500 text-sm">No damage assessments recorded.</p>
              ) : (
                damage.map(d => (
                  <div key={d.id} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-200">{d.category}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        d.status === 'VERIFIED' ? 'bg-success text-darkslate' : 
                        d.status === 'ASSESSED' ? 'bg-warning text-darkslate' : 
                        'bg-gray-600 text-gray-200'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      Severity: <span className={`${d.severity === 'CRITICAL' ? 'text-danger font-bold' : ''}`}>{d.severity}</span>
                    </div>
                    {d.estimated_damage && (
                      <div className="text-xs text-gray-500 italic mt-2">
                        Est: {d.estimated_damage}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-600 mt-2 uppercase">
                      Source: {d.source_type}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RecoveryDashboard;

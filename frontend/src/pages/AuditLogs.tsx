import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AuditLogs = () => {
  const { user } = useAuth();
  const isAuthorized = user && (user.role === 'Authority' || user.role === 'Admin');

  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = `/audit?page=${page}&limit=50${filterAction ? `&action=${filterAction}` : ''}`;
      const [logRes, sumRes] = await Promise.all([
        api.get(url),
        api.get('/audit/summary')
      ]);
      setLogs(logRes.data.data.logs);
      setTotalPages(logRes.data.data.pagination.pages);
      setSummary(sumRes.data.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) fetchLogs();
  }, [page, filterAction, isAuthorized]);

  if (!isAuthorized) return (
    <div className="bg-danger/20 border border-danger text-danger p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-lg">
      <h2 className="text-2xl font-bold mb-2">403 Forbidden</h2>
      <p>Access Denied: Audit Logs are strictly restricted to Authority and Admin personnel.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="border-b border-gray-700 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Audit & Security Logs</h1>
          <p className="text-gray-400 text-sm mt-1">Immutable record of high-value operational and security events.</p>
        </div>
      </header>

      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-darkslate p-4 rounded-xl border border-gray-700 text-center">
            <h3 className="text-gray-400 text-xs font-bold uppercase">Total Events</h3>
            <p className="text-2xl text-white font-mono mt-1">{summary.total_events}</p>
          </div>
          <div className="bg-darkslate p-4 rounded-xl border border-gray-700 text-center">
            <h3 className="text-warning text-xs font-bold uppercase">Security Events</h3>
            <p className="text-2xl text-warning font-mono mt-1">{summary.security_events}</p>
          </div>
          <div className="bg-darkslate p-4 rounded-xl border border-gray-700 text-center">
            <h3 className="text-danger text-xs font-bold uppercase">Failed / Denied</h3>
            <p className="text-2xl text-danger font-mono mt-1">{(parseInt(summary.failed_events || 0) + parseInt(summary.denied_events || 0))}</p>
          </div>
          <div className="bg-darkslate p-4 rounded-xl border border-gray-700 text-center">
            <h3 className="text-info text-xs font-bold uppercase">Admin Events</h3>
            <p className="text-2xl text-info font-mono mt-1">{summary.admin_events}</p>
          </div>
        </div>
      )}

      <div className="bg-darkslate rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-charcoal">
          <input 
            type="text" 
            placeholder="Filter by Action (e.g. AUTH_LOGIN, INCIDENT_CREATED)" 
            value={filterAction} 
            onChange={e => setFilterAction(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded focus:ring-warning focus:border-warning block w-96 p-2"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-mono">No audit logs found.</td></tr>
              ) : logs.map((log: any) => (
                <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-xs whitespace-nowrap font-mono">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-200">{log.actor_name || 'System'}</span>
                    <br/><span className="text-[10px] text-gray-500">{log.actor_type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-info">{log.action}</td>
                  <td className="px-4 py-3 text-xs">
                    {log.entity_type} {log.entity_id && <span className="text-gray-500">#{log.entity_id}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 border rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'text-success border-success bg-success/10' :
                      log.status === 'FAILED' ? 'text-danger border-danger bg-danger/10' :
                      'text-warning border-warning bg-warning/10'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 truncate max-w-xs" title={log.description}>{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center text-sm text-gray-400">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            &larr; Prev
          </button>
          <span>Page {page} of {totalPages || 1}</span>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DataSources = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshingId, setRefreshingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const res = await api.get('/data-sources');
        setSources(res.data.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
            setError('403 Forbidden: You do not have permission to view this page.');
        } else {
            setError(err.response?.data?.message || 'Failed to fetch data sources');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  const handleRefresh = async (id: number) => {
    setRefreshingId(id);
    try {
      await api.post(`/data-sources/${id}/refresh`);
      // Re-fetch
      const res = await api.get('/data-sources');
      setSources(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to refresh source');
    } finally {
      setRefreshingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'ONLINE' || status === 'HEALTHY') return 'text-success border-success';
    if (status === 'DEGRADED') return 'text-warning border-warning';
    return 'text-danger border-danger';
  };

  if (loading) return <div className="p-8 text-gray-400">Loading data sources...</div>;
  if (error) return <div className="p-8 text-danger font-bold text-xl">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold mb-2">Data Source Administration</h1>
        <p className="text-gray-400">Manage external APIs, official warnings, and dataset pipelines.</p>
      </header>

      <div className="bg-darkslate rounded-xl border border-gray-700 overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-charcoal text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
              <th className="px-6 py-4">Source Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4">Records</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sources.map(source => (
              <tr key={source.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-200">{source.name}</div>
                  <div className="text-xs text-gray-500">{source.provider}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-700 px-2 py-1 rounded text-xs font-mono">{source.source_type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`border px-2 py-1 rounded text-xs font-bold ${getStatusColor(source.status)}`}>
                    {source.status}
                  </span>
                  {source.last_error && (
                    <div className="text-xs text-danger mt-1 max-w-xs truncate" title={source.last_error}>
                      {source.last_error}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {source.last_success_at ? new Date(source.last_success_at).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                  {source.record_count}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleRefresh(source.id)}
                    disabled={refreshingId === source.id || !source.enabled}
                    className="bg-warning hover:bg-yellow-500 text-darkslate font-bold py-1 px-3 rounded text-sm disabled:opacity-50 transition-colors"
                  >
                    {refreshingId === source.id ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No data sources registered. Run database migration to populate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataSources;

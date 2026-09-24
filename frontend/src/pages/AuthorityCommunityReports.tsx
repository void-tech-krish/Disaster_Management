import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthorityCommunityReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchReports = async () => {
    try {
      const res = await api.get('/community-reports/authority');
      setReports(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load community reports queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId: number, actionType: string) => {
    let newStatus = 'UNDER_REVIEW';
    let newVerif = 'UNVERIFIED';
    let isPublic = false;
    let note = '';

    if (actionType === 'VERIFY') {
      newStatus = 'VERIFIED';
      newVerif = 'VERIFIED';
      isPublic = true;
      note = 'Verified by authority after review.';
    } else if (actionType === 'REJECT') {
      newStatus = 'REJECTED';
      newVerif = 'REJECTED';
    } else if (actionType === 'RESOLVE') {
      newStatus = 'RESOLVED';
      newVerif = 'VERIFIED';
    } else if (actionType === 'REVIEW') {
      newStatus = 'UNDER_REVIEW';
    }

    try {
      await api.patch(`/community-reports/authority/${reportId}/verify`, {
        status: newStatus,
        verificationStatus: newVerif,
        authorityNotes: note,
        isPublic: isPublic
      });
      toast.success(`Report status updated to ${newStatus}`);
      fetchReports();
    } catch (err) {
      toast.error('Failed to update report.');
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading Authority Queue...</div>;

  const filteredReports = filter === 'ALL' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <span className="mr-3">📡</span> Community Reports Queue
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Review, verify, and link citizen observations to incidents or response cases.
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-darkslate border border-gray-700 p-4 rounded-xl cursor-pointer" onClick={() => setFilter('ALL')}>
          <h3 className="text-xs text-gray-400 font-bold uppercase mb-1">Total Queue</h3>
          <p className="text-2xl font-bold">{reports.length}</p>
        </div>
        <div className="bg-darkslate border border-info/50 p-4 rounded-xl cursor-pointer" onClick={() => setFilter('RECEIVED')}>
          <h3 className="text-xs text-info font-bold uppercase mb-1">New Received</h3>
          <p className="text-2xl font-bold text-info">{reports.filter(r => r.status === 'RECEIVED').length}</p>
        </div>
        <div className="bg-darkslate border border-warning/50 p-4 rounded-xl cursor-pointer" onClick={() => setFilter('UNDER_REVIEW')}>
          <h3 className="text-xs text-warning font-bold uppercase mb-1">Under Review</h3>
          <p className="text-2xl font-bold text-warning">{reports.filter(r => r.status === 'UNDER_REVIEW').length}</p>
        </div>
        <div className="bg-darkslate border border-success/50 p-4 rounded-xl cursor-pointer" onClick={() => setFilter('VERIFIED')}>
          <h3 className="text-xs text-success font-bold uppercase mb-1">Verified</h3>
          <p className="text-2xl font-bold text-success">{reports.filter(r => r.status === 'VERIFIED').length}</p>
        </div>
      </div>

      {/* Report List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reports match the current filter.</p>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="bg-darkslate border border-gray-700 rounded-xl p-5 shadow-lg flex flex-col lg:flex-row justify-between items-start">
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-mono bg-charcoal text-gray-400 px-2 py-1 rounded">{report.report_code}</span>
                  <span className="text-xs font-bold bg-gray-700 text-white px-2 py-1 rounded">{report.category}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                    report.status === 'RECEIVED' ? 'bg-info/20 text-info border border-info' :
                    report.status === 'VERIFIED' ? 'bg-success/20 text-success border border-success' :
                    report.status === 'REJECTED' ? 'bg-danger/20 text-danger border border-danger' :
                    'bg-warning/20 text-warning border border-warning'
                  }`}>
                    {report.status}
                  </span>
                  {report.severity === 'CRITICAL' && <span className="bg-danger text-white text-[10px] font-bold px-2 py-1 rounded">CRITICAL</span>}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1">{report.title}</h3>
                <p className="text-sm text-gray-300 mb-2">{report.description}</p>
                <div className="text-xs text-gray-500 flex flex-wrap gap-4">
                  <span>📍 {report.address_text || `${report.latitude}, ${report.longitude}`}</span>
                  <span>⏱️ Obs: {new Date(report.observed_at).toLocaleString()}</span>
                  <span>Citizen ID: {report.user_id}</span>
                </div>
              </div>

              <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-wrap lg:flex-col gap-2 min-w-[140px]">
                {report.status === 'RECEIVED' && (
                  <button onClick={() => handleAction(report.id, 'REVIEW')} className="w-full bg-warning text-darkslate px-3 py-1.5 rounded text-xs font-bold hover:bg-yellow-500 transition-colors">
                    Start Review
                  </button>
                )}
                {(report.status === 'RECEIVED' || report.status === 'UNDER_REVIEW') && (
                  <>
                    <button onClick={() => handleAction(report.id, 'VERIFY')} className="w-full bg-success text-darkslate px-3 py-1.5 rounded text-xs font-bold hover:bg-green-500 transition-colors">
                      Verify & Publish
                    </button>
                    <button onClick={() => handleAction(report.id, 'REJECT')} className="w-full bg-danger text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-500 transition-colors">
                      Reject
                    </button>
                  </>
                )}
                {report.status === 'VERIFIED' && (
                  <>
                    <button className="w-full bg-charcoal text-white border border-gray-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-gray-700 transition-colors">
                      Link to Incident
                    </button>
                    <button onClick={() => handleAction(report.id, 'RESOLVE')} className="w-full bg-info text-darkslate px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-400 transition-colors">
                      Mark Resolved
                    </button>
                  </>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuthorityCommunityReports;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/community-reports/my')
        .then(res => setReports(res.data.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) return <div className="p-8 text-center text-gray-400">Please login to view your reports.</div>;
  if (loading) return <div className="p-8 text-gray-400">Loading your reports...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">My Community Reports</h1>
          <p className="text-gray-400 mt-1">Track the status of observations you've submitted.</p>
        </div>
        <Link to="/report" className="bg-info text-darkslate px-4 py-2 rounded font-bold shadow hover:bg-blue-400 transition-colors">
          + New Report
        </Link>
      </header>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-darkslate border border-gray-700 p-8 rounded-xl text-center">
            <p className="text-gray-400 mb-4">You haven't submitted any reports yet.</p>
            <Link to="/report" className="text-info hover:underline font-bold">Submit your first observation</Link>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="bg-darkslate border border-gray-700 p-5 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 font-mono bg-charcoal px-2 py-0.5 rounded">{report.report_code}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-gray-700 text-gray-200">{report.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    report.status === 'RECEIVED' ? 'bg-info/20 text-info border border-info/30' :
                    report.status === 'VERIFIED' ? 'bg-success/20 text-success border border-success/30' :
                    report.status === 'UNDER_REVIEW' ? 'bg-warning/20 text-warning border border-warning/30' :
                    report.status === 'REJECTED' ? 'bg-danger/20 text-danger border border-danger/30' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {report.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{report.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{report.address_text || `${report.latitude}, ${report.longitude}`}</p>
                <p className="text-xs text-gray-500 mt-2">Submitted: {new Date(report.created_at).toLocaleString()}</p>
                
                {report.authority_notes && (
                  <div className="mt-3 bg-charcoal/50 border-l-2 border-warning p-2 text-sm text-gray-300">
                    <strong className="text-warning text-xs uppercase block mb-1">Authority Note:</strong>
                    {report.authority_notes}
                  </div>
                )}
              </div>
              
              <div className="text-right w-full md:w-auto flex justify-between md:block items-center">
                <div className="text-sm mb-2">
                  Verification: <span className={`font-bold ${report.verification_status === 'VERIFIED' ? 'text-success' : 'text-gray-400'}`}>{report.verification_status}</span>
                </div>
                <button className="text-sm text-info hover:underline">View Details</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyReports;

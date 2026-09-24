import { useState, useEffect } from 'react';
import api from '../services/api';
import { Truck, Package, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LogisticsDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/logistics/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch logistics requests');
    }
  };

  const approveRequest = async (id: string) => {
    try {
      await api.patch(`/logistics/requests/${id}/approve`);
      toast.success('Request approved');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to approve request');
    }
  };

  const assignRequest = async (id: string) => {
    try {
      await api.patch(`/logistics/requests/${id}/assign`);
      toast.success('Resource assigned');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to assign request');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Logistics & Supply Chain Intelligence</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm flex flex-col items-center justify-center">
            <Package className="h-8 w-8 text-blue-600 mb-2" />
            <div className="text-lg font-semibold">Total Requests</div>
            <div className="text-3xl font-bold text-blue-700">{requests.length}</div>
        </div>
        <div className="bg-orange-100 p-4 rounded-xl border border-orange-200 shadow-sm flex flex-col items-center justify-center">
            <Clock className="h-8 w-8 text-orange-600 mb-2" />
            <div className="text-lg font-semibold">Pending</div>
            <div className="text-3xl font-bold text-orange-700">{requests.filter(r => r.status === 'SUBMITTED').length}</div>
        </div>
        <div className="bg-purple-100 p-4 rounded-xl border border-purple-200 shadow-sm flex flex-col items-center justify-center">
            <Truck className="h-8 w-8 text-purple-600 mb-2" />
            <div className="text-lg font-semibold">In Transit</div>
            <div className="text-3xl font-bold text-purple-700">{requests.filter(r => r.status === 'ASSIGNED').length}</div>
        </div>
        <div className="bg-green-100 p-4 rounded-xl border border-green-200 shadow-sm flex flex-col items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <div className="text-lg font-semibold">Delivered</div>
            <div className="text-3xl font-bold text-green-700">{requests.filter(r => r.status === 'DELIVERED').length}</div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow border border-gray-200 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Recent Resource Requests</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No requests found.</td>
                </tr>
            ) : requests.map((req: any) => (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.resource_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.requested_quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {req.priority}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {req.status === 'SUBMITTED' && (
                    <button onClick={() => approveRequest(req.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Approve</button>
                  )}
                  {req.status === 'APPROVED' && (
                    <button onClick={() => assignRequest(req.id)} className="text-green-600 hover:text-green-900">Assign</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

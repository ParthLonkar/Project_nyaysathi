import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaint.service';

export default function AdminPanel() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllComplaints();
  }, [filter]);

  const fetchAllComplaints = async () => {
    try {
      const data = await complaintService.getAllComplaints(filter);
      setComplaints(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>
        
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">All Complaints</option>
            <option value="new">New</option>
            <option value="processing">Processing</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div className="overflow-x-auto card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(complaint => (
                  <tr key={complaint.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{complaint.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{complaint.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        complaint.priority === 'high' ? 'bg-red-100 text-red-800' :
                        complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{complaint.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(complaint.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="btn-secondary text-xs">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

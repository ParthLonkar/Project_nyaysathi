import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { complaintService } from '../services/complaint.service';
import { Filter, Search } from 'lucide-react';

export default function AdminPanel() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredComplaints = complaints.filter(complaint =>
    complaint.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800',
    };
    return colors[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'processing': 'bg-orange-100 text-orange-800',
      'escalated': 'bg-red-100 text-red-800',
      'resolved': 'bg-green-100 text-green-800',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="page-section bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="container-lg">
          {/* Header */}
          <div className="mb-12">
            <h1 className="section-header mb-2">Admin Dashboard</h1>
            <p className="section-subheader">Manage and track all complaints across your department</p>
          </div>

          {/* Controls */}
          <div className="card p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="form-label">🔍 Search Complaints</label>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              {/* Filter */}
              <div>
                <label className="form-label">⚙️ Filter Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Complaints</option>
                  <option value="new">New</option>
                  <option value="processing">Processing</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 text-center">
              <p className="text-4xl font-black text-blue-600 mb-2">{complaints.length}</p>
              <p className="font-bold text-gray-600">Total Complaints</p>
            </div>
            <div className="card p-6 text-center">
              <p className="text-4xl font-black text-orange-600 mb-2">{complaints.filter(c => c.status === 'new').length}</p>
              <p className="font-bold text-gray-600">New</p>
            </div>
            <div className="card p-6 text-center">
              <p className="text-4xl font-black text-yellow-600 mb-2">{complaints.filter(c => c.status === 'processing').length}</p>
              <p className="font-bold text-gray-600">Processing</p>
            </div>
            <div className="card p-6 text-center">
              <p className="text-4xl font-black text-green-600 mb-2">{complaints.filter(c => c.status === 'resolved').length}</p>
              <p className="font-bold text-gray-600">Resolved</p>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="card p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wide">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wide">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wide">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wide">Priority</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wide">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wide">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((complaint, idx) => (
                      <tr key={complaint.id} className={`border-b border-gray-200 hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 text-sm font-mono font-bold text-gray-900">{complaint.id?.slice(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 max-w-xs truncate">{complaint.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{complaint.category}</td>
                        <td className="px-6 py-4">
                          <span className={`badge ${getPriorityColor(complaint.priority)} capitalize`}>
                            {complaint.priority || 'normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${getStatusColor(complaint.status)} capitalize`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(complaint.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button className="btn-secondary text-xs py-2 px-3">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card p-16 text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-2xl font-bold text-gray-900 mb-2">No Complaints Found</p>
              <p className="text-gray-600">Try adjusting your filter or search criteria</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, AlertCircle, TrendingUp, Filter, Plus } from 'lucide-react';
import { API_BASE_URL } from '../utils/api.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('complaints');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Check authentication
  useEffect(() => {
    const adminData = localStorage.getItem('adminUser');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(adminData));
  }, [navigate]);

  // Fetch dashboard data
  useEffect(() => {
    if (!admin) return;
    fetchDashboardData();
  }, [admin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      // Fetch complaints
      const complaintsRes = await fetch(`${API_BASE_URL}/admin/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (complaintsRes.ok) {
        const { complaints: data } = await complaintsRes.json();
        setComplaints(data || []);
      }

      // Fetch staff
      const staffRes = await fetch(`${API_BASE_URL}/admin/staff`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (staffRes.ok) {
        const { staff: data } = await staffRes.json();
        setStaff(data || []);
      }

      // Fetch dashboard summary
      const dashboardRes = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (dashboardRes.ok) {
        const { stats } = await dashboardRes.json();
        setSummary(stats);
      }

      // Fetch analytics
      const analyticsRes = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (analyticsRes.ok) {
        const { analytics: data } = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleAssignComplaint = async (staffId) => {
    if (!selectedComplaint) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/assign-complaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          complaintId: selectedComplaint.id,
          staffId: staffId
        })
      });

      if (response.ok) {
        setShowAssignModal(false);
        setSelectedComplaint(null);
        fetchDashboardData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!admin) {
    return null;
  }

  const filteredComplaints = filterStatus
    ? complaints.filter(c => c.status === filterStatus)
    : complaints;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">{admin.department_id} Department</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Complaints</p>
                      <p className="text-3xl font-bold text-gray-900">{summary.total_complaints}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">{summary.pending}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">In Progress</p>
                      <p className="text-3xl font-bold text-orange-600">{summary.in_progress}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Resolved</p>
                      <p className="text-3xl font-bold text-green-600">{summary.resolved}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b flex">
                <button
                  onClick={() => setActiveTab('complaints')}
                  className={`flex-1 px-4 py-3 font-semibold text-center ${
                    activeTab === 'complaints'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Complaints
                </button>
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`flex-1 px-4 py-3 font-semibold text-center ${
                    activeTab === 'staff'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Staff Management
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Complaints Tab */}
                {activeTab === 'complaints' && (
                  <div>
                    <div className="mb-4 flex gap-2 items-center">
                      <Filter className="w-5 h-5 text-gray-600" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">All Status</option>
                        <option value="routed">Routed</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Title</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Priority</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Assigned Staff</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredComplaints.map(complaint => (
                            <tr key={complaint.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{complaint.title}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{complaint.category}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  complaint.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {complaint.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                  {complaint.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {complaint.department_staff?.staff_name || 'Unassigned'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {!complaint.assigned_staff_id && (
                                  <button
                                    onClick={() => {
                                      setSelectedComplaint(complaint);
                                      setShowAssignModal(true);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                                  >
                                    Assign
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Staff Tab */}
                {activeTab === 'staff' && (
                  <div>
                    <div className="mb-4">
                      <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                        <Plus className="w-4 h-4" />
                        Add New Staff
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {staff.map(member => (
                        <div key={member.id} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{member.staff_name}</h3>
                              <p className="text-sm text-gray-600">{member.position}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              member.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Email: {member.email}</p>
                            <p>Phone: {member.phone || 'N/A'}</p>
                            <p>Complaints Assigned: {member.complaints_assigned}</p>
                            <p>Resolved: {member.complaints_resolved}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Assign Complaint</h2>
            <p className="text-gray-600 mb-4">Complaint: {selectedComplaint.title}</p>
            
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {staff.filter(s => s.is_active).map(member => (
                <button
                  key={member.id}
                  onClick={() => handleAssignComplaint(member.id)}
                  className="w-full text-left p-3 hover:bg-indigo-50 border rounded-lg transition"
                >
                  <p className="font-semibold text-gray-900">{member.staff_name}</p>
                  <p className="text-sm text-gray-600">{member.position}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedComplaint(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

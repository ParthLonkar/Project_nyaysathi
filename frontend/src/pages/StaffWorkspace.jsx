import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/api.js';

export default function StaffWorkspace() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [tabs, setTabs] = useState('complaints');
  const [noteText, setNoteText] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');

  // Check authentication
  useEffect(() => {
    const staffData = localStorage.getItem('staffUser');
    if (!staffData) {
      navigate('/staff/login');
      return;
    }
    setStaff(JSON.parse(staffData));
  }, [navigate]);

  // Fetch staff data
  useEffect(() => {
    if (!staff) return;
    fetchComplaintsData();
  }, [staff]);

  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('staffToken');

      // Fetch assigned complaints
      const complaintsRes = await fetch(`${API_BASE_URL}/staff/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (complaintsRes.ok) {
        const { complaints: data } = await complaintsRes.json();
        setComplaints(data || []);
      }

      // Fetch dashboard summary
      const dashboardRes = await fetch(`${API_BASE_URL}/staff/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (dashboardRes.ok) {
        const { summary } = await dashboardRes.json();
        setDashboard(summary);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    navigate('/staff/login');
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedComplaint) return;

    try {
      const token = localStorage.getItem('staffToken');
      const response = await fetch(
        `${API_BASE_URL}/staff/complaints/${selectedComplaint.id}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({ noteText })
        }
      );

      if (response.ok) {
        setNoteText('');
        // Refresh complaint details
        const detailRes = await fetch(
          `${API_BASE_URL}/staff/complaints/${selectedComplaint.id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
          }
        );
        if (detailRes.ok) {
          const { complaint } = await detailRes.json();
          setSelectedComplaint(complaint);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusUpdate || !selectedComplaint) return;

    try {
      const token = localStorage.getItem('staffToken');
      const response = await fetch(
        `${API_BASE_URL}/staff/complaints/${selectedComplaint.id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({ status: statusUpdate })
        }
      );

      if (response.ok) {
        setStatusUpdate('');
        fetchComplaintsData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!staff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Workspace</h1>
            <p className="text-gray-600">{staff.staff_name} - {staff.position}</p>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {dashboard && (
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Assigned</p>
                      <p className="text-3xl font-bold text-gray-900">{dashboard.total_assigned}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">In Progress</p>
                      <p className="text-3xl font-bold text-orange-600">{dashboard.in_progress}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Resolved</p>
                      <p className="text-3xl font-bold text-green-600">{dashboard.resolved}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">SLA Achievement</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {dashboard.performance?.sla_achievement_rate || 0}%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Complaints List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <h2 className="font-semibold text-gray-900">Assigned Complaints</h2>
                  </div>
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {complaints.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedComplaint(item.complaints)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                          selectedComplaint?.id === item.complaints?.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.complaints?.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Category: {item.complaints?.category}
                        </p>
                        <div className="mt-2 flex gap-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            item.complaints?.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : item.complaints?.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.complaints?.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                            {item.complaints?.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Complaint Details */}
              <div className="lg:col-span-2">
                {selectedComplaint ? (
                  <div className="bg-white rounded-lg shadow">
                    {/* Complaint Header */}
                    <div className="p-6 border-b">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedComplaint.title}
                      </h2>
                      <div className="flex gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          selectedComplaint.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : selectedComplaint.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedComplaint.priority.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800">
                          {selectedComplaint.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600">{selectedComplaint.description}</p>
                    </div>

                    {/* Tabs */}
                    <div className="border-b flex">
                      <button
                        onClick={() => setTabs('details')}
                        className={`flex-1 px-4 py-3 font-semibold text-center ${
                          tabs === 'details'
                            ? 'border-b-2 border-green-600 text-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setTabs('notes')}
                        className={`flex-1 px-4 py-3 font-semibold text-center ${
                          tabs === 'notes'
                            ? 'border-b-2 border-green-600 text-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Notes & Updates
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                      {tabs === 'details' && (
                        <div className="space-y-4">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <p className="text-sm text-emerald-800 font-semibold mb-1">Staff Action Note</p>
                            <p className="text-sm text-emerald-900">
                              {selectedComplaint.ai_analysis?.staff_action_note || 'No staff action note available yet.'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Category</p>
                            <p className="font-semibold text-gray-900">{selectedComplaint.category}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Submitted Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(selectedComplaint.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">SLA Days</p>
                            <p className="font-semibold text-gray-900">{selectedComplaint.sla_days} days</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Progress</p>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${selectedComplaint.progress_percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {selectedComplaint.progress_percentage}%
                            </p>
                          </div>
                        </div>
                      )}

                      {tabs === 'notes' && (
                        <div className="space-y-6">
                          {/* Status Update */}
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Update Status
                            </label>
                            <select
                              value={statusUpdate}
                              onChange={(e) => setStatusUpdate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                            >
                              <option value="">Select new status</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="pending_review">Pending Review</option>
                            </select>
                            <button
                              onClick={handleUpdateStatus}
                              disabled={!statusUpdate}
                              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                            >
                              Update Status
                            </button>
                          </div>

                          {/* Complaint Notes */}
                          {selectedComplaint.complaint_notes && selectedComplaint.complaint_notes.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-3">Previous Notes</h3>
                              <div className="space-y-3">
                                {selectedComplaint.complaint_notes.map(note => (
                                  <div key={note.id} className="bg-gray-50 p-3 rounded-lg border">
                                    <p className="text-sm text-gray-700">{note.note_text}</p>
                                    <p className="text-xs text-gray-600 mt-2">
                                      - {note.created_by_name} on {new Date(note.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Add Note */}
                          <div className="bg-green-50 p-4 rounded-lg border">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Add Note
                            </label>
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add your notes or updates..."
                              rows="4"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                            ></textarea>
                            <button
                              onClick={handleAddNote}
                              disabled={!noteText.trim()}
                              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                            >
                              Add Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-600">Select a complaint to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

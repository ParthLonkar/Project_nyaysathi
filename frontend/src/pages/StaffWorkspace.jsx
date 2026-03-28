import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api.js';
import GeneratedDocumentsPanel from '../components/GeneratedDocumentsPanel';

export default function StaffWorkspace() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const staffData = localStorage.getItem('staffUser');
    if (!staffData) {
      navigate('/staff/login');
      return;
    }
    setStaff(JSON.parse(staffData));
  }, [navigate]);

  useEffect(() => {
    if (!staff) return;
    fetchComplaintsData();
  }, [staff]);

  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('staffToken');

      const complaintsRes = await fetch(`${API_BASE_URL}/staff/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      if (complaintsRes.ok) {
        const { complaints: data } = await complaintsRes.json();
        setComplaints(data || []);
      }

      const dashboardRes = await fetch(`${API_BASE_URL}/staff/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const staffName = staff?.staff_name || 'Staff User';
  const staffRole = staff?.position || 'Senior Clerk';

  const assignments = useMemo(() => {
    return (complaints || [])
      .filter(Boolean)
      .map((item) => {
        const complaint = item?.complaints || item || {};
        return {
          id: complaint.id || item.id || crypto.randomUUID?.() || Math.random().toString(36).slice(2),
          reference_id: complaint.reference_id || complaint.tracking_id || complaint.id || 'N/A',
          title: complaint.title || 'Untitled Complaint',
          category: complaint.category || 'General',
          priority: complaint.priority || 'medium',
          status: complaint.status || 'new',
          updated_at: complaint.updated_at || complaint.created_at || complaint.submitted_at
        };
      });
  }, [complaints]);

  const complaintDocuments = selectedComplaint?.documents
    || selectedComplaint?.ai_analysis?.documents
    || [];
  const staffComplaintDraft = selectedComplaint?.ai_analysis?.complaint_draft || '';
  const staffRtiDraft = selectedComplaint?.ai_analysis?.rti_draft || '';

  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-slate-500 text-sm">Loading staff dashboard...</div>
      </div>
    );
  }

  const totalAssigned = dashboard?.total_assigned ?? assignments.length;
  const inProgress = dashboard?.in_progress ?? 0;
  const resolved = dashboard?.resolved ?? 0;
  const slaRate = dashboard?.performance?.sla_achievement_rate ?? 0;

  const recentAssignments = assignments.slice(0, 4);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-slate-50 border-r border-slate-200/50 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-primary-fixed">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
            </div>
            <div>
              <h1 className="font-headline font-extrabold text-emerald-950 tracking-tight text-lg">NyaySathi</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Legal Workspace</p>
            </div>
          </div>
          <nav className="flex flex-col gap-y-1">
            <div className="flex items-center gap-3 px-4 py-3 bg-white text-emerald-900 font-bold rounded-lg shadow-sm transition-all duration-300">
              <span className="material-symbols-outlined text-emerald-700" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              <span className="font-body text-sm">Dashboard</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/staff/task')}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800 transition-all duration-300 rounded-lg group text-left"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-700">assignment_turned_in</span>
              <span className="font-body text-sm font-medium">My Tasks</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/staff/profile')}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800 transition-all duration-300 rounded-lg group text-left"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-700">description</span>
              <span className="font-body text-sm font-medium">Documents</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/staff/profile')}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800 transition-all duration-300 rounded-lg group text-left"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-700">settings</span>
              <span className="font-body text-sm font-medium">Settings</span>
            </button>
          </nav>
          <button className="mt-8 w-full py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-body text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 hover:scale-[1.02] transition-transform">
            <span>New Complaint</span>
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
        <div className="mt-auto p-6 border-t border-slate-200/50">
          <nav className="flex flex-col gap-y-1">
            <a className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-emerald-800 transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">contact_support</span>
              <span className="font-body text-xs font-medium">Support</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-error transition-colors text-left"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="font-body text-xs font-medium">Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="h-16 flex justify-between items-center px-8 w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-700 transition-colors">search</span>
              <input className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-emerald-500/20 transition-all" placeholder="Global Search..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 pl-2 cursor-pointer group">
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-950 leading-tight">{staffName}</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">{staffRole}</p>
              </div>
<<<<<<< HEAD
              <div className="w-9 h-9 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined">person</span>
=======

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
                          <GeneratedDocumentsPanel
                            documents={complaintDocuments}
                            complaintDraftText={staffComplaintDraft}
                            rtiDraftText={staffRtiDraft}
                            compact
                          />
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
>>>>>>> c3d1cc5 (feat: Add complaint PDF genration)
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <section className="p-10 flex-1 bg-surface-container-low">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-headline text-5xl font-bold text-primary tracking-tight mb-2">Welcome back, {staffName.split(' ')[0]}</h2>
              <p className="text-secondary font-body max-w-2xl">Stay on top of your assigned cases and manage your legal workflow efficiently.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-lg bg-primary-fixed/30 text-primary-container">
                    <span className="material-symbols-outlined">folder_open</span>
                  </div>
                  <span className="text-xs font-bold text-primary-container bg-primary-fixed px-2 py-1 rounded">Active Cases</span>
                </div>
                <div className="mb-4">
                  <h3 className="text-4xl font-headline font-extrabold text-on-surface">{totalAssigned}</h3>
                  <p className="text-xs text-secondary font-medium mt-1">Total pending verification</p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[65%] rounded-full"></div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-lg bg-secondary-fixed/50 text-on-secondary-fixed-variant">
                    <span className="material-symbols-outlined">clock_loader_40</span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">In Motion</span>
                </div>
                <div className="mb-4">
                  <h3 className="text-4xl font-headline font-extrabold text-on-surface">{inProgress}</h3>
                  <p className="text-xs text-secondary font-medium mt-1">Processing in legal workflow</p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[82%] rounded-full"></div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">Resolved</span>
                </div>
                <div className="mb-4">
                  <h3 className="text-4xl font-headline font-extrabold text-on-surface">{resolved}</h3>
                  <p className="text-xs text-secondary font-medium mt-1">Cases closed this quarter</p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[95%] rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-primary text-white p-8 rounded-2xl relative overflow-hidden h-full flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container rounded-full -mr-16 -mt-16 opacity-50"></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed mb-6">Performance Index</p>
                    <h4 className="text-2xl font-headline font-bold mb-8">Efficiency Metrics</h4>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <p className="text-sm font-medium text-primary-fixed">Resolution Rate</p>
                          <p className="text-lg font-bold">{slaRate}%</p>
                        </div>
                        <div className="w-full bg-primary-container h-1 rounded-full">
                          <div className="bg-white h-full w-[94%] rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <p className="text-sm font-medium text-primary-fixed">Avg. Processing Time</p>
                          <p className="text-lg font-bold">2.4 Days</p>
                        </div>
                        <div className="w-full bg-primary-container h-1 rounded-full">
                          <div className="bg-white h-full w-[40%] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12">
                    <div className="flex items-center gap-4 bg-primary-container/40 p-4 rounded-xl backdrop-blur-sm">
                      <span className="material-symbols-outlined text-primary-fixed text-3xl">trending_up</span>
                      <div>
                        <p className="text-xs text-primary-fixed">Vs Last Month</p>
                        <p className="text-sm font-bold">+12% Higher Velocity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm h-full">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="text-xl font-headline font-bold text-on-surface">Recent Assignments</h4>
                    <button
                      onClick={() => navigate('/staff/task')}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      View Full Queue <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-4">
                      <thead>
                        <tr className="text-left">
                          <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-4">Case ID</th>
                          <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Title & Category</th>
                          <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                          <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right pr-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && (
                          <tr>
                            <td colSpan="4" className="py-6 text-center text-sm text-slate-500">Loading assignments...</td>
                          </tr>
                        )}
                        {!loading && recentAssignments.length === 0 && (
                          <tr>
                            <td colSpan="4" className="py-6 text-center text-sm text-slate-500">No recent assignments.</td>
                          </tr>
                        )}
                        {!loading && recentAssignments.map((row) => (
                          <tr key={row.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-4 pl-4 align-middle">
                              <span className="text-sm font-bold text-on-surface">{row.reference_id}</span>
                            </td>
                            <td className="py-4 align-middle">
                              <div>
                                <p className="text-sm font-bold text-on-surface leading-none mb-1">{row.title}</p>
                                <p className="text-[11px] text-slate-500 font-medium">{row.category}</p>
                              </div>
                            </td>
                            <td className="py-4 align-middle">
                              <span className="px-3 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                {row.status}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-right align-middle">
                              <button className="text-xs font-bold text-primary-container px-4 py-2 bg-secondary-fixed rounded-lg hover:bg-primary hover:text-white transition-all">
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

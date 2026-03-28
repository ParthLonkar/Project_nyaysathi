import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api.js';

export default function StaffTasks() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredAssignments = assignments.filter((row) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      String(row.reference_id || '').toLowerCase().includes(term) ||
      String(row.title || '').toLowerCase().includes(term)
    );
  });

  const formatTimestamp = (value) => {
    if (!value) return 'Updated recently';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Updated recently';
    return `Updated ${date.toLocaleDateString()}`;
  };

  const statusStyles = {
    new: 'bg-emerald-100 text-emerald-900',
    assigned: 'bg-emerald-100 text-emerald-900',
    in_progress: 'bg-amber-50 text-amber-600',
    processing: 'bg-amber-50 text-amber-600',
    resolved: 'bg-primary-fixed text-on-primary-fixed',
    pending_review: 'bg-amber-50 text-amber-600'
  };

  const priorityStyles = {
    high: { dot: 'bg-error', text: 'text-error', label: 'High' },
    medium: { dot: 'bg-amber-400', text: 'text-amber-700', label: 'Medium' },
    low: { dot: 'bg-slate-300', text: 'text-slate-500', label: 'Low' }
  };

  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-slate-500 text-sm">Loading staff tasks...</div>
      </div>
    );
  }

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
            <button
              type="button"
              onClick={() => navigate('/staff/dashboard')}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800 transition-all duration-300 rounded-lg group text-left"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-700">dashboard</span>
              <span className="font-body text-sm font-medium">Dashboard</span>
            </button>
            <div className="flex items-center gap-3 px-4 py-3 bg-white text-emerald-900 font-bold rounded-lg shadow-sm transition-all duration-300">
              <span className="material-symbols-outlined text-emerald-700" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_turned_in</span>
              <span className="font-body text-sm">My Tasks</span>
            </div>
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
              <div className="w-9 h-9 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <section className="p-10 flex-1 bg-surface-container-low">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-headline text-5xl font-bold text-primary tracking-tight mb-2">Assigned Tasks</h2>
              <p className="text-secondary font-body max-w-2xl">Manage and track your active legal complaints. Prioritize urgent matters and ensure timely resolution for all designated clients.</p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_40px_rgba(25,28,29,0.04)] overflow-hidden">
              <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
                <div className="relative w-full md:w-96">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 placeholder:text-slate-400"
                    placeholder="Filter by Reference ID or Title..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-5 py-3 flex items-center gap-2 bg-slate-100 text-slate-700 rounded-xl font-body text-sm font-semibold hover:bg-slate-200 transition-colors">
                    <span className="material-symbols-outlined text-lg">filter_list</span>
                    <span>Filters</span>
                  </button>
                  <button className="px-5 py-3 flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl font-body text-sm font-semibold hover:bg-emerald-100 transition-colors">
                    <span className="material-symbols-outlined text-lg">download</span>
                    <span>Export List</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 font-label text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reference ID</th>
                      <th className="px-8 py-4 font-label text-[10px] font-bold text-slate-500 uppercase tracking-widest">Complaint Title</th>
                      <th className="px-8 py-4 font-label text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                      <th className="px-8 py-4 font-label text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                      <th className="px-8 py-4 font-label text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-4 font-label text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading && (
                      <tr>
                        <td colSpan="6" className="px-8 py-6 text-center text-sm text-slate-500">Loading assignments...</td>
                      </tr>
                    )}
                    {!loading && filteredAssignments.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-8 py-6 text-center text-sm text-slate-500">No assignments found.</td>
                      </tr>
                    )}
                    {!loading && filteredAssignments.map((row) => {
                      const priority = priorityStyles[row.priority] || priorityStyles.medium;
                      const statusKey = String(row.status || 'new');
                      const statusClass = statusStyles[statusKey] || 'bg-emerald-100 text-emerald-900';
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-8 py-5">
                            <span className="font-mono text-sm font-semibold text-emerald-900 bg-emerald-50 px-2 py-1 rounded">{row.reference_id}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="max-w-xs">
                              <p className="font-body text-sm font-bold text-on-surface truncate">{row.title}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{formatTimestamp(row.updated_at)}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="font-body text-xs text-secondary bg-secondary-container/30 px-3 py-1 rounded-full">{row.category}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${priority.dot}`}></span>
                              <span className={`font-body text-xs font-semibold ${priority.text}`}>{priority.label}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${statusClass}`}>
                              {statusKey.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button className="text-primary font-body text-xs font-bold hover:underline underline-offset-4 flex items-center justify-end gap-1">
                              View Details
                              <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-8 py-6 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
                <p className="text-xs text-slate-500 font-medium">Showing <span className="text-slate-900">1 to {Math.min(filteredAssignments.length, 5)}</span> of {filteredAssignments.length} complaints</p>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-emerald-700 disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-900 text-white shadow-md font-bold text-sm">1</button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-emerald-700 font-bold text-sm">2</button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-emerald-700 font-bold text-sm">3</button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-emerald-700">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-900/5 p-6 rounded-2xl border border-emerald-900/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-900/10 flex items-center justify-center text-emerald-900">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800/60">Avg. Response Time</p>
                  <p className="text-2xl font-headline font-extrabold text-emerald-950">14.2 Hours</p>
                </div>
              </div>
              <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700/60">Urgent Pending</p>
                  <p className="text-2xl font-headline font-extrabold text-amber-900">03 Tasks</p>
                </div>
              </div>
              <div className="bg-sky-500/5 p-6 rounded-2xl border border-sky-500/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-700">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700/60">This Week's Closure</p>
                  <p className="text-2xl font-headline font-extrabold text-sky-900">12 Resolved</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

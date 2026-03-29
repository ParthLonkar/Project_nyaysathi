import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Search, Settings, Bell, Filter, Download, Eye, MoreVertical,
  TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { API_BASE_URL } from '../utils/api.js';

export default function AdminDashboardNew() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Activities');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());

  useEffect(() => {
    const adminData = localStorage.getItem('adminUser');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(adminData));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      // Fetch complaints
      const complaintRes = await fetch(`${API_BASE_URL}/admin/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (complaintRes.ok) {
        const data = await complaintRes.json();
        setComplaints(data.complaints || []);
      }

      // Fetch performance stats
      const statsRes = await fetch(`${API_BASE_URL}/user/performance`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(complaints.map((_, i) => i)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'new': 'bg-blue-50 text-blue-700',
      'open': 'bg-cyan-50 text-cyan-700',
      'pending': 'bg-orange-50 text-orange-700',
      'resolved': 'bg-green-50 text-green-700',
      'closed': 'bg-gray-50 text-gray-700',
      'escalated': 'bg-red-50 text-red-700'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-50 text-gray-700';
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filterType === 'Urgent Only') {
      return complaint.priority === 'high' || complaint.priority === 'urgent';
    }
    if (filterType === 'Assigned to Me') {
      return complaint.assigned_to === admin?.id;
    }
    return searchTerm === '' || 
           complaint.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           complaint.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           complaint.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const displayComplaints = filteredComplaints.slice(0, 10);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="text-lg">Loading...</div></div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-slate-50 dark:bg-slate-950 flex flex-col p-4 space-y-2 font-manrope font-medium text-sm border-r border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            ≡
          </div>
          <div>
            <h2 className="font-black text-blue-900 dark:text-white leading-tight">NyaySathi</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-900 text-blue-800 dark:text-blue-200 shadow-sm rounded-lg hover:translate-x-1 transition-transform" href="#dashboard">
            <span>📊</span>
            <span>Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-lg hover:translate-x-1 transition-transform" href="#complaints">
            <span>📋</span>
            <span>Complaints</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-lg hover:translate-x-1 transition-transform" href="#staff">
            <span>👥</span>
            <span>Staff</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-lg hover:translate-x-1 transition-transform" href="#analytics">
            <span>📈</span>
            <span>Analytics</span>
          </a>
        </nav>

        <div className="px-2 pb-4">
          <button className="w-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            New Case
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-lg hover:translate-x-1 transition-transform" href="#support">
            <span>❓</span>
            <span>Support</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg hover:translate-x-1 transition-transform"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {/* Top Bar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/15 flex justify-between items-center px-8 py-3 shadow-sm">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-blue-900 dark:text-white">Overview</h1>
            <nav className="hidden md:flex items-center gap-6 font-manrope text-sm">
              <a className="text-blue-700 dark:text-blue-300 font-semibold" href="#case-law">Case Law</a>
              <a className="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors" href="#directives">Directives</a>
              <a className="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors" href="#archive">Archive</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Global search..."
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all"
              />
            </div>
            <button className="p-2 text-slate-500 hover:text-indigo-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500 hover:text-indigo-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 ml-2"></div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto space-y-12">
          {/* Welcome */}
          <section className="space-y-2">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back, {admin?.admin_name || 'Administrator'}</h2>
            <p className="text-slate-600 dark:text-slate-400">Here is the latest intelligence from the NyaySathi ecosystem. {complaints.length} complaints require your attention.</p>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Complaints */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-none transition-all hover:shadow-md shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                  <span>📋</span>
                </div>
                <span className="flex items-center text-green-600 text-xs font-bold bg-green-100/30 px-2 py-1 rounded">
                  <TrendingUp className="w-3 h-3 mr-1" /> +12%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Complaints</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats?.total || 0}</h3>
            </div>

            {/* Resolved */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-none transition-all hover:shadow-md shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg">
                  <span>✅</span>
                </div>
                <span className="flex items-center text-green-600 text-xs font-bold bg-green-100/30 px-2 py-1 rounded">
                  <TrendingUp className="w-3 h-3 mr-1" /> +5%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Resolved Cases</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats?.resolved || 0}</h3>
            </div>

            {/* Pending */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-none transition-all hover:shadow-md shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                  <span>⏳</span>
                </div>
                <span className="flex items-center text-red-600 text-xs font-bold bg-red-100/30 px-2 py-1 rounded">
                  <TrendingDown className="w-3 h-3 mr-1" /> -2%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Review</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats?.pending || 0}</h3>
            </div>

            {/* Escalated */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-none transition-all hover:shadow-md shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg">
                  <span>🚨</span>
                </div>
                <span className="flex items-center text-red-600 text-xs font-bold bg-red-100/30 px-2 py-1 rounded">
                  <TrendingUp className="w-3 h-3 mr-1" /> +18%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Escalated Files</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats?.escalated || 0}</h3>
            </div>
          </section>

          {/* Search & Filter */}
          <section className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Case ID, Complainant Name, or Legal Subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-colors">
                <Filter className="w-4 h-4" />
                Advanced Filters
              </button>
              <button className="p-3 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* Complaints Table */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Complaints</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase">View:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-sm border-none bg-transparent font-semibold text-indigo-600 focus:ring-0 cursor-pointer dark:text-indigo-400"
                >
                  <option>All Activities</option>
                  <option>Urgent Only</option>
                  <option>Assigned to Me</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-4 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                    </th>
                    <th className="px-6 py-4">Case ID</th>
                    <th className="px-6 py-4">Complainant</th>
                    <th className="px-6 py-4">Subject Matter</th>
                    <th className="px-6 py-4">Filing Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {displayComplaints.map((complaint, idx) => (
                    <tr key={complaint.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-8 py-5">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(idx)}
                          onChange={() => handleSelectRow(idx)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                      </td>
                      <td className="px-6 py-5 font-bold text-indigo-600 dark:text-indigo-400">
                        #{complaint.reference_id}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600">
                            {complaint.customer_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {complaint.customer_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-xs truncate text-slate-600 dark:text-slate-400">
                        {complaint.title}
                      </td>
                      <td className="px-6 py-5 text-slate-600 dark:text-slate-400">
                        {new Date(complaint.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {complaint.staffAssignment?.staff_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="text-slate-900 dark:text-white font-medium">
                            {complaint.staffAssignment?.staff_name || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(complaint.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                          {complaint.status || 'new'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
              <p>Showing 1-{Math.min(10, displayComplaints.length)} of {filteredComplaints.length} complaints</p>
              <div className="flex gap-2">
                <button className="p-2 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-30" disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded">1</button>
                <button className="px-3 py-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">2</button>
                <button className="px-3 py-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">3</button>
                <button className="p-2 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Bottom Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Portal Health */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Portal Health</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Real-time status of all active judicial management modules.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Database Latency</span>
                    <span className="text-green-600 font-bold text-xs uppercase">Optimal</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[94%]"></div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Server Capacity</span>
                    <span className="text-orange-600 font-bold text-xs uppercase">Moderate</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full w-[62%]"></div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last backup: 14m ago</span>
                <button className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">View Logs</button>
              </div>
            </div>

            {/* Staff Activity */}
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 p-8 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Staff Activity Stream</h4>
                <button className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">See Audit Trail</button>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-700 flex items-center justify-center text-indigo-600">
                      ✏️
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-white"><span className="font-bold">Admin Profile</span> updated the resolution status for <span className="text-indigo-600 dark:text-indigo-400 font-semibold">#MC-2024-001</span></p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">2 minutes ago • Admin Action</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-700 flex items-center justify-center text-indigo-600">
                      ✅
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-white"><span className="font-bold">System</span> auto-assigned 4 new complaints to the <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Department Staff</span></p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">45 minutes ago • System Event</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-700 flex items-center justify-center text-indigo-600">
                      ⚠️
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-white"><span className="font-bold">Security Alert</span> - Unusual activity detected and validated.</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">1 hour ago • Security</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

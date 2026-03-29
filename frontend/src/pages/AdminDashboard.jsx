import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api.js';
import DailyReport from '../components/DailyReport.jsx';
import GeneratedDocumentsPanel from '../components/GeneratedDocumentsPanel.jsx';

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
  const [showDetailView, setShowDetailView] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [addStaffLoading, setAddStaffLoading] = useState(false);
  const [addStaffError, setAddStaffError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    staff_name: '',
    email: '',
    position: '',
    phone: '',
    expertise_area: ''
  });
  const [expertiseAreas, setExpertiseAreas] = useState([]); // For tag management
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-profile-menu]')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setAddStaffError('');
    
    // Validate required fields
    if (!formData.username || !formData.password || !formData.staff_name || !formData.email || !formData.position) {
      setAddStaffError('Please fill in all required fields');
      return;
    }

    try {
      setAddStaffLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/admin/add-staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Reset form
        setFormData({
          username: '',
          password: '',
          staff_name: '',
          email: '',
          position: '',
          phone: '',
          expertise_area: ''
        });
        setShowAddStaffModal(false);
        // Refresh staff list
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        setAddStaffError(errorData.message || 'Failed to add staff member');
      }
    } catch (err) {
      setAddStaffError(err.message);
    } finally {
      setAddStaffLoading(false);
    }
  };

  if (!admin) {
    return null;
  }

  const filteredComplaints = filterStatus
    ? complaints.filter(c => c.status === filterStatus)
    : complaints;

  const getStatusColor = (status) => {
    switch(status) {
      case 'assigned': return 'bg-secondary-container/20 text-secondary';
      case 'in_progress': return 'bg-secondary-container/20 text-secondary';
      case 'resolved': return 'bg-tertiary/10 text-tertiary';
      case 'routed': return 'bg-primary/10 text-primary';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-error-container/10 text-error';
      case 'medium': return 'bg-slate-100 text-slate-600';
      case 'low': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };
  const totalComplaints = Number(summary?.total_complaints || 0);
  const resolvedCount = Number(summary?.resolved || 0);
  const pendingCount = Number(summary?.pending || 0);
  const inProgressCount = Number(summary?.in_progress || 0);

  const pct = (value, total) => {
    if (!total) return 0;
    return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
  };

  const kpiCards = [
    {
      label: 'Total Complaints',
      value: totalComplaints,
      icon: 'description',
      textColor: 'text-primary',
      chipColor: 'text-primary bg-primary/10',
      barColor: 'bg-primary',
      progress: 100,
      trendLabel: 'Live count',
    },
    {
      label: 'Resolved Cases',
      value: resolvedCount,
      icon: 'check_circle',
      textColor: 'text-tertiary',
      chipColor: 'text-tertiary bg-tertiary/10',
      barColor: 'bg-tertiary',
      progress: pct(resolvedCount, totalComplaints),
      trendLabel: `${pct(resolvedCount, totalComplaints)}% of total`,
    },
    {
      label: 'Pending Review',
      value: pendingCount,
      icon: 'pending_actions',
      textColor: 'text-secondary',
      chipColor: 'text-secondary bg-secondary/10',
      barColor: 'bg-secondary',
      progress: pct(pendingCount, totalComplaints),
      trendLabel: `${pct(pendingCount, totalComplaints)}% of total`,
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      icon: 'priority_high',
      textColor: 'text-error',
      chipColor: 'text-error bg-error/10',
      barColor: 'bg-error',
      progress: pct(inProgressCount, totalComplaints),
      trendLabel: `${pct(inProgressCount, totalComplaints)}% of total`,
    },
  ];
  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col p-6 space-y-4 overflow-y-auto font-headline">
        {/* Logo */}
        <div className="mb-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-xl">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-primary uppercase tracking-widest">Jurist Admin</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">Premium Legal Tech</p>
          </div>
        </div>

        {/* New Complaint Button */}
        <button className="w-full bg-primary hover:bg-primary-container text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 active:scale-95 shadow-lg shadow-primary/20 font-bold">
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="text-sm">New Complaint</span>
        </button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 mt-8">
          <div 
            onClick={() => setActiveTab('overview')}
            className={`rounded-lg flex items-center px-4 py-3 space-x-3 cursor-pointer transition-all ${activeTab === 'overview' ? 'bg-white text-primary shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="text-sm">Overview</span>
          </div>
          <div 
            onClick={() => setActiveTab('complaints')}
            className={`rounded-lg flex items-center px-4 py-3 space-x-3 cursor-pointer transition-all ${activeTab === 'complaints' ? 'bg-white text-primary shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
            <span className="material-symbols-outlined text-xl">folder_open</span>
            <span className="text-sm">Complaints</span>
          </div>
          <div 
            onClick={() => setActiveTab('staff')}
            className={`rounded-lg flex items-center px-4 py-3 space-x-3 cursor-pointer transition-all ${activeTab === 'staff' ? 'bg-white text-primary shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
            <span className="material-symbols-outlined text-xl">people</span>
            <span className="text-sm">Staff Management</span>
          </div>
          <div 
            onClick={() => setActiveTab('daily-report')}
            className={`rounded-lg flex items-center px-4 py-3 space-x-3 cursor-pointer transition-all ${activeTab === 'daily-report' ? 'bg-white text-primary shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
            <span className="material-symbols-outlined text-xl">calendar_today</span>
            <span className="text-sm">Daily Report</span>
          </div>
          <div className="text-slate-600 hover:bg-slate-100 rounded-lg flex items-center px-4 py-3 space-x-3 cursor-pointer transition-transform duration-200 hover:translate-x-1">
            <span className="material-symbols-outlined text-xl">gavel</span>
            <span className="text-sm">Legal Research</span>
          </div>
          <div className="text-slate-600 hover:bg-slate-100 rounded-lg flex items-center px-4 py-3 space-x-3 cursor-pointer transition-transform duration-200 hover:translate-x-1">
            <span className="material-symbols-outlined text-xl">verified_user</span>
            <span className="text-sm">Compliance</span>
          </div>
        </nav>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-200 space-y-1">
          <div className="text-slate-600 hover:bg-slate-100 rounded-lg flex items-center px-4 py-3 space-x-3 cursor-pointer transition-transform duration-200 hover:translate-x-1">
            <span className="material-symbols-outlined text-xl">help_outline</span>
            <span className="text-sm">Help Center</span>
          </div>
          <div className="text-slate-600 hover:bg-slate-100 rounded-lg flex items-center px-4 py-3 space-x-3 cursor-pointer transition-transform duration-200 hover:translate-x-1" onClick={handleLogout}>
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="text-sm">Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen flex-1">
        {/* Top Navigation */}
        <header className="fixed top-0 right-0 w-[calc(100%-256px)] z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 shadow-sm border-b border-slate-100 font-headline">
          <div className="flex items-center space-x-6 flex-1">
            <div className="relative group hidden md:block">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">search</span>
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                placeholder="Search case ID, client..."
                type="text"
              />
            </div>
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium ml-auto">
              <a className="text-primary border-b-2 border-primary font-semibold pb-1" href="#">Dashboard</a>
              <a className="text-slate-500 hover:text-primary transition-colors" href="#">Matters</a>
              <a className="text-slate-500 hover:text-primary transition-colors" href="#">Documents</a>
            </nav>
          </div>

          <div className="flex items-center space-x-5 ml-8">
            <button className="text-slate-500 hover:bg-slate-50 p-2 rounded-lg transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
            </button>
            <button className="text-slate-500 hover:bg-slate-50 p-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-5 relative" data-profile-menu>
              <div 
                className="text-right hidden sm:block cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <p className="text-xs font-bold text-primary">{admin?.staff_name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-500 font-medium">{admin?.position || 'Administrator'}</p>
              </div>
              <img
                alt="User avatar"
                className="w-10 h-10 rounded-lg object-cover ring-2 ring-primary/10 cursor-pointer hover:ring-primary/30 transition-all"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5nCnkY_fb_U5cF73Rhv7NN7zcpJMgLcgSoUejKnr_ma9ZzqGdt_aRXAMJ9h5CZsfLlYPAC_jQ9hcy7kQlH4x20sRWMLf4LR4GCKsKoI8Si_JsbKRqZPhP4n8B_Lv2tFsB52B2cbwCrGwF91JieflE85gl0MWAWV00921cPZJ4KZPUmPMM2CdyPi4u0nWB4Jv_J80JeJnPxLCu6ldRnsWSeF_nu5SYtynDKOsMDnBXIvQlciiNqvcdlxFnGwr77zZn1KVMGlRkIE8A"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              />

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute top-14 right-0 w-72 bg-white rounded-lg shadow-2xl border border-outline-variant z-50 overflow-hidden max-h-[90vh] overflow-y-auto">
                  
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-outline-variant">
                    <div className="flex items-center space-x-3">
                      <img
                        alt="Profile"
                        className="w-14 h-14 rounded-lg object-cover ring-2 ring-primary"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5nCnkY_fb_U5cF73Rhv7NN7zcpJMgLcgSoUejKnr_ma9ZzqGdt_aRXAMJ9h5CZsfLlYPAC_jQ9hcy7kQlH4x20sRWMLf4LR4GCKsKoI8Si_JsbKRqZPhP4n8B_Lv2tFsB52B2cbwCrGwF91JieflE85gl0MWAWV00921cPZJ4KZPUmPMM2CdyPi4u0nWB4Jv_J80JeJnPxLCu6ldRnsWSeF_nu5SYtynDKOsMDnBXIvQlciiNqvcdlxFnGwr77zZn1KVMGlRkIE8A"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-headline text-xs font-bold text-on-surface truncate">{admin?.staff_name || 'Admin User'}</p>
                        <p className="text-[9px] text-secondary mt-0.5">{admin?.position || 'Administrator'}</p>
                        <div className="mt-2 inline-flex items-center space-x-1.5 bg-green-100 px-2.5 py-1 rounded-lg border border-green-300 shadow-sm">
                          <span className="material-symbols-outlined text-[13px] text-green-700" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                          <span className="text-[8px] font-bold text-green-700">Admin Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Information Section */}
                  <div className="p-4 border-b border-outline-variant space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.12em] font-bold text-primary/60 mb-2">Account Information</p>
                    <div className="space-y-2">
                      
                      {/* Employee ID */}
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-primary mt-0.5" style={{fontSize: '16px'}}>badge</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-slate-500 font-medium">Employee ID</p>
                          <p className="text-xs font-semibold text-on-surface truncate">{admin?.id ? String(admin.id).substring(0, 8).toUpperCase() : 'ADM-0001'}</p>
                        </div>
                      </div>

                      {/* Department */}
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-secondary mt-0.5" style={{fontSize: '16px'}}>domain</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-slate-500 font-medium">Department</p>
                          <p className="text-xs font-semibold text-on-surface truncate">{typeof admin?.department === 'string' ? admin.department : admin?.department?.name || 'Administration'}</p>
                        </div>
                      </div>

                      {/* Contact Email */}
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-tertiary mt-0.5" style={{fontSize: '16px'}}>mail</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-slate-500 font-medium">Email</p>
                          <p className="text-xs font-semibold text-on-surface truncate">{typeof admin?.email === 'string' ? admin.email : admin?.email?.email || 'admin@nyaysathi.gov.in'}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-primary mt-0.5" style={{fontSize: '16px'}}>phone</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-slate-500 font-medium">Office Phone</p>
                          <p className="text-xs font-semibold text-on-surface truncate">{typeof admin?.phone === 'string' ? admin.phone : admin?.phone?.phone || '+91-11-XXXX-XXXX'}</p>
                        </div>
                      </div>

                      {/* Last Login */}
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-slate-400 mt-0.5" style={{fontSize: '16px'}}>schedule</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-slate-500 font-medium">Last Login</p>
                          <p className="text-xs font-semibold text-on-surface">Today at 09:45 AM</p>
                        </div>
                      </div>

                      {/* Account Status */}
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-green-600 mt-0.5" style={{fontSize: '16px'}}>check_circle</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-slate-500 font-medium">Account Status</p>
                          <p className="text-xs font-semibold text-green-700">Active & Verified</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Section */}
                  <div className="p-4 border-b border-outline-variant">
                    <p className="text-[9px] uppercase tracking-[0.12em] font-bold text-primary/60 mb-2">Performance</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-primary-container/30 p-2 rounded-lg text-center">
                        <p className="text-sm font-bold text-primary">{complaints?.length || 0}</p>
                        <p className="text-[8px] text-slate-600 font-medium mt-0.5">Total Cases</p>
                      </div>
                      <div className="bg-secondary-container/30 p-2 rounded-lg text-center">
                        <p className="text-sm font-bold text-secondary">{summary?.resolved_complaints || 0}</p>
                        <p className="text-[8px] text-slate-600 font-medium mt-0.5">Resolved</p>
                      </div>
                      <div className="bg-tertiary-container/30 p-2 rounded-lg text-center">
                        <p className="text-sm font-bold text-tertiary">{staff?.length || 0}</p>
                        <p className="text-[8px] text-slate-600 font-medium mt-0.5">Team Size</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Items Section */}
                  <div className="p-2 space-y-1">
                    <button className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-surface-container rounded-lg transition-colors text-left">
                      <span className="material-symbols-outlined text-primary flex-shrink-0" style={{fontSize: '18px'}}>person</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-on-surface">View Full Profile</p>
                        <p className="text-[8px] text-slate-500">Detailed information</p>
                      </div>
                    </button>

                    <button className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-surface-container rounded-lg transition-colors text-left">
                      <span className="material-symbols-outlined text-secondary flex-shrink-0" style={{fontSize: '18px'}}>edit</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Edit Profile</p>
                        <p className="text-[8px] text-slate-500">Update information</p>
                      </div>
                    </button>

                    <button className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-surface-container rounded-lg transition-colors text-left">
                      <span className="material-symbols-outlined text-tertiary flex-shrink-0" style={{fontSize: '18px'}}>lock</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Change Password</p>
                        <p className="text-[8px] text-slate-500">Update security</p>
                      </div>
                    </button>

                    <button className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-surface-container rounded-lg transition-colors text-left">
                      <span className="material-symbols-outlined text-slate-400 flex-shrink-0" style={{fontSize: '18px'}}>download</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Download ID</p>
                        <p className="text-[8px] text-slate-500">Admin credentials</p>
                      </div>
                    </button>

                    <div className="border-t border-outline-variant my-1"></div>

                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-error-container/20 rounded-lg transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-error flex-shrink-0" style={{fontSize: '18px'}}>logout</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-error">Sign Out</p>
                        <p className="text-[8px] text-error/60">End session</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="pt-24 px-8 pb-12">
          {error && (
            <div className="mb-6 p-4 bg-error-container/20 text-error rounded-lg border border-error/20">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Overview & Complaints Tab */}
              {(activeTab === 'overview' || activeTab === 'complaints') && (
                <>
                  {/* Analytics Grid */}
                  {summary && (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                      {kpiCards.map((card) => (
                        <div key={card.label} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group border border-slate-100">
                          <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.textColor} bg-slate-100 group-hover:bg-white transition-colors`}>
                              <span className="material-symbols-outlined">{card.icon}</span>
                            </div>
                            <div className={`flex items-center font-bold text-xs px-2 py-1 rounded-full ${card.chipColor}`}>
                              <span className="material-symbols-outlined text-xs mr-1">insights</span>
                              {card.trendLabel}
                            </div>
                          </div>
                          <h3 className="text-slate-500 text-sm font-semibold mb-1">{card.label}</h3>
                          <p className="text-3xl font-headline font-bold text-on-surface">{card.value}</p>
                          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${card.barColor}`} style={{ width: `${card.progress}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </section>
                  )}

              {/* Complaints Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-xl font-headline font-extrabold text-primary">Active Complaints</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50">
                      <button className="px-3 py-1.5 text-xs font-bold bg-white shadow-sm rounded-md text-primary">All</button>
                      <button className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors">Urgent</button>
                      <button className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors">New</button>
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors bg-white"
                    >
                      <option value="">All Status</option>
                      <option value="routed">Routed</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <input type="checkbox" className="rounded text-primary focus:ring-primary w-4 h-4" />
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredComplaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowDetailView(true);
                        }}>
                          <td className="px-6 py-4">
                            <input type="checkbox" className="rounded text-primary focus:ring-primary w-4 h-4" onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-on-surface">{complaint.title}</p>
                            <p className="text-xs text-slate-500">{complaint.reference_id}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">{complaint.category}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(complaint.status)} italic`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold">
                            {complaint.department_staff?.staff_name || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                            {!complaint.assigned_staff_id && (
                              <button
                                onClick={() => {
                                  setSelectedComplaint(complaint);
                                  setShowAssignModal(true);
                                }}
                                className="text-primary hover:text-primary-container font-semibold transition-colors"
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

                <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">Showing 1-{filteredComplaints.length} of {complaints.length} complaints</p>
                  <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
                </>
              )}

              {/* Staff Management Tab */}
              {activeTab === 'staff' && (
                <div>
                  {/* Staff Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-headline font-bold text-primary">Staff Management</h2>
                      <p className="text-sm text-slate-600 mt-2">Manage your team and track performance</p>
                    </div>
                    <button onClick={() => setShowAddStaffModal(true)} className="bg-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 active:scale-95">
                      <span className="material-symbols-outlined">add</span>
                      <span>Add Staff Member</span>
                    </button>
                  </div>

                  {/* Staff Table */}
                  {staff.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="px-3 py-3 text-left font-semibold text-slate-700 text-[10px] uppercase tracking-wide whitespace-nowrap">Name</th>
                            <th className="px-3 py-3 text-left font-semibold text-slate-700 text-[10px] uppercase tracking-wide whitespace-nowrap">Position</th>
                            <th className="px-3 py-3 text-left font-semibold text-slate-700 text-[10px] uppercase tracking-wide whitespace-nowrap">Email</th>
                            <th className="px-2 py-3 text-center font-semibold text-slate-700 text-[10px] uppercase tracking-wide whitespace-nowrap">Phone</th>
                            <th className="px-2 py-3 text-center font-semibold text-slate-700 text-[10px] uppercase tracking-wide whitespace-nowrap">Dept</th>
                            <th className="px-2 py-3 text-center font-semibold text-slate-700 text-[10px] uppercase tracking-wide whitespace-nowrap">Cases</th>
                            <th className="px-2 py-3 text-center font-semibold text-slate-700 text-[10px] uppercase tracking-wide whitespace-nowrap">Resolve %</th>
                            <th className="px-2 py-3 text-center font-semibold text-slate-700 text-[10px] uppercase tracking-wide whitespace-nowrap">Status</th>
                            <th className="px-2 py-3 text-center font-semibold text-slate-700 text-[10px] uppercase tracking-wide whitespace-nowrap">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {staff.map((member) => (
                            <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-2.5">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-base">account_circle</span>
                                  </div>
                                  <p className="font-semibold text-on-surface truncate text-xs">{member.staff_name}</p>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <p className="text-slate-600 truncate text-xs">{member.position}</p>
                              </td>
                              <td className="px-3 py-2.5">
                                <a href={`mailto:${member.email}`} className="text-primary hover:text-primary-container truncate text-xs block">{member.email}</a>
                              </td>
                              <td className="px-2 py-2.5">
                                <p className="text-slate-600 text-xs text-center">{member.phone || 'N/A'}</p>
                              </td>
                              <td className="px-2 py-2.5">
                                <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-medium whitespace-nowrap">
                                  {member.department_name ? member.department_name.substring(0, 10) : 'N/A'}
                                </span>
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <p className="font-semibold text-primary text-xs">{member.cases_handled || 0}</p>
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <p className="font-semibold text-secondary text-xs">{member.resolution_rate || 0}%</p>
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${member.is_active ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                  <span className={`text-[9px] font-bold uppercase whitespace-nowrap ${member.is_active ? 'text-green-600' : 'text-slate-500'}`}>
                                    {member.is_active ? 'Active' : 'Off'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 py-2.5">
                                <div className="flex items-center justify-center space-x-1">
                                  <button className="p-1 rounded text-xs font-bold text-primary border border-primary hover:bg-primary/5 transition-colors" title="Edit">
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                  </button>
                                  <button className="p-1 rounded text-xs font-bold text-error border border-error hover:bg-error/5 transition-colors" title="More">
                                    <span className="material-symbols-outlined text-sm">more_vert</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-slate-100">
                      <span className="material-symbols-outlined text-6xl text-slate-300 flex justify-center mb-4">people</span>
                      <p className="text-slate-600 font-semibold text-lg">No staff members found</p>
                      <p className="text-sm text-slate-500 mt-2">Add your first staff member to get started</p>
                    </div>
                  )}
                </div>
              )}

              {/* Daily Report Tab */}
              {activeTab === 'daily-report' && (
                <div>
                  <DailyReport adminToken={localStorage.getItem('adminToken')} />
                </div>
              )}
            </>
          )}

          {/* Assign Modal */}
          {showAssignModal && selectedComplaint && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-slate-200">
                <h2 className="text-lg font-headline font-bold mb-4 text-on-surface">Assign Complaint</h2>
                <p className="text-slate-600 mb-6 text-sm">{selectedComplaint.title}</p>

                <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                  {staff.filter(s => s.is_active).map(member => (
                    <button
                      key={member.id}
                      onClick={() => handleAssignComplaint(member.id)}
                      className="w-full text-left p-4 hover:bg-primary/5 border border-slate-200 rounded-lg transition-colors"
                    >
                      <p className="font-semibold text-on-surface">{member.staff_name}</p>
                      <p className="text-sm text-slate-600">{member.position}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedComplaint(null);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-on-surface hover:bg-slate-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Complaint Detail View */}
          {showDetailView && selectedComplaint && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-end z-50">
              <div className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col">
                {/* Detail Header */}
                <div className="border-b border-slate-200 p-6 flex justify-between items-start sticky top-0 bg-white">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Complaint Details</p>
                    <h2 className="text-2xl font-headline font-bold text-on-surface">{selectedComplaint.title}</h2>
                    <p className="text-sm text-slate-600 mt-2">{selectedComplaint.reference_id}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailView(false);
                      setSelectedComplaint(null);
                    }}
                    className="text-slate-500 hover:text-slate-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Status & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedComplaint.status)} italic`}>
                        {selectedComplaint.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Priority</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase ${getPriorityColor(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority}
                      </span>
                    </div>
                  </div>

                  {/* Category & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category</p>
                      <p className="text-sm text-on-surface font-semibold">{selectedComplaint.category}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date Filed</p>
                      <p className="text-sm text-on-surface font-semibold">
                        {selectedComplaint.created_at 
                          ? new Date(selectedComplaint.created_at).toLocaleDateString() 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Assigned Staff */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Assigned To</p>
                    {selectedComplaint.staffAssignment?.staff_name && selectedComplaint.staffAssignment?.staff_name !== 'Unassigned' ? (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="font-semibold text-on-surface">{selectedComplaint.staffAssignment.staff_name}</p>
                        <p className="text-sm text-slate-600">{selectedComplaint.staffAssignment.position}</p>
                      </div>
                    ) : selectedComplaint.department_staff ? (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="font-semibold text-on-surface">{selectedComplaint.department_staff.staff_name}</p>
                        <p className="text-sm text-slate-600">{selectedComplaint.department_staff.position}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No staff assigned</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Description</p>
                    <p className="text-sm text-on-surface leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-200">
                      {selectedComplaint.description || 'No description available'}
                    </p>
                  </div>

                  {/* AI Analysis if available */}
                  {selectedComplaint.ai_analysis && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">AI Insights</p>
                      <div className="space-y-3">
                        {selectedComplaint.ai_analysis.admin_brief && (
                          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <p className="text-xs font-bold text-primary uppercase mb-2">Admin Brief</p>
                            <p className="text-sm text-on-surface">{selectedComplaint.ai_analysis.admin_brief}</p>
                          </div>
                        )}
                        {selectedComplaint.ai_analysis.escalation_risk && (
                          <div className="p-4 bg-error-container/10 rounded-lg border border-error/10">
                            <p className="text-xs font-bold text-error uppercase mb-2">Escalation Risk</p>
                            <p className="text-sm text-on-surface">{selectedComplaint.ai_analysis.escalation_risk}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <GeneratedDocumentsPanel
                    documents={selectedComplaint.documents || selectedComplaint.ai_analysis?.documents || []}
                    complaintDraftText={selectedComplaint.ai_analysis?.complaint_draft || ''}
                    rtiDraftText={selectedComplaint.ai_analysis?.rti_draft || ''}
                    compact
                  />
                </div>

                {/* Detail Footer */}
                <div className="border-t border-slate-200 p-6 bg-slate-50 flex gap-3">
                  {!selectedComplaint.assigned_staff_id && (
                    <button
                      onClick={() => {
                        setShowDetailView(false);
                        setShowAssignModal(true);
                      }}
                      className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-container transition-colors"
                    >
                      Assign to Staff
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowDetailView(false);
                      setSelectedComplaint(null);
                    }}
                    className="flex-1 bg-white text-on-surface border border-slate-300 py-3 px-4 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Staff Modal */}
          {showAddStaffModal && (
            <>
              {/* Background Skeleton (Blurred) */}
              <div className="fixed inset-0 z-40 flex overflow-hidden filter blur-md opacity-40 grayscale pointer-events-none">
                <aside className="fixed left-0 top-0 h-full flex flex-col p-6 space-y-8 bg-slate-100 w-64">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary"></div>
                    <div>
                      <div className="h-4 w-24 bg-slate-300 rounded mb-1"></div>
                      <div className="h-3 w-16 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  <nav className="space-y-4">
                    <div className="h-10 w-full bg-white rounded-lg"></div>
                    <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
                    <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
                  </nav>
                </aside>
                <main className="ml-64 flex-1 p-12">
                  <header className="flex justify-between items-end mb-12">
                    <div>
                      <div className="h-8 w-64 bg-slate-300 rounded mb-4"></div>
                      <div className="h-4 w-96 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-12 w-40 bg-primary-container rounded-lg"></div>
                  </header>
                  <div className="grid grid-cols-3 gap-8">
                    <div className="h-64 bg-white rounded-xl shadow-sm"></div>
                    <div className="h-64 bg-white rounded-xl shadow-sm"></div>
                    <div className="h-64 bg-white rounded-xl shadow-sm"></div>
                  </div>
                </main>
              </div>

              {/* Overlay Dimmer */}
              <div className="fixed inset-0 z-41 bg-on-surface/10 backdrop-blur-sm"></div>

              {/* Modal Container */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
                <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-outline-variant/10 my-8">
                  {/* Modal Header */}
                  <div className="px-6 pt-8 pb-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="font-headline text-2xl font-extrabold text-primary tracking-tight mb-1">Create New Staff</h2>
                        <p className="text-on-surface-variant text-xs max-w-sm line-clamp-2">Onboard a new legal professional or administrator to the NyaySathi ecosystem.</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowAddStaffModal(false);
                          setFormData({
                            username: '',
                            password: '',
                            staff_name: '',
                            email: '',
                            position: '',
                            phone: '',
                            expertise_area: ''
                          });
                          setExpertiseAreas([]);
                          setAddStaffError('');
                        }}
                        className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <form onSubmit={handleAddStaff} className="px-6 pb-8 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Error Message */}
                    {addStaffError && (
                      <div className="p-3 bg-error-container/20 text-on-error-container rounded-lg border border-error/20 text-xs flex items-start space-x-2">
                        <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">error</span>
                        <span>{addStaffError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                      {/* Section: Authentication Credentials */}
                      <div className="col-span-full flex items-center space-x-2 mb-1">
                        <span className="h-px flex-1 bg-outline-variant/20"></span>
                        <span className="font-headline text-[9px] uppercase tracking-[0.15em] font-bold text-primary/60">Auth Credentials</span>
                        <span className="h-px flex-1 bg-outline-variant/20"></span>
                      </div>

                      {/* Username */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Username <span className="text-error">*</span></label>
                        <div className="relative group">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-base group-focus-within:text-primary transition-colors">person</span>
                          <input
                            type="text"
                            placeholder="e.g., j_doe_legal"
                            maxLength="50"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-outline-variant text-sm focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Password <span className="text-error">*</span></label>
                        <div className="relative group">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-base group-focus-within:text-primary transition-colors">lock</span>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-outline-variant text-sm focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                            required
                          />
                        </div>
                      </div>

                      {/* Section: Professional Profile */}
                      <div className="col-span-full flex items-center space-x-2 mt-3 mb-1">
                        <span className="h-px flex-1 bg-outline-variant/20"></span>
                        <span className="font-headline text-[9px] uppercase tracking-[0.15em] font-bold text-primary/60">Professional Profile</span>
                        <span className="h-px flex-1 bg-outline-variant/20"></span>
                      </div>

                      {/* Full Staff Name */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Staff Name <span className="text-error">*</span></label>
                        <input
                          type="text"
                          placeholder="Johnathan Doe"
                          maxLength="100"
                          value={formData.staff_name}
                          onChange={(e) => setFormData({...formData, staff_name: e.target.value})}
                          className="w-full px-3 py-2.5 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-outline-variant text-sm focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                          required
                        />
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Email <span className="text-error">*</span></label>
                        <input
                          type="email"
                          placeholder="j.doe@nyaysathi.org"
                          maxLength="100"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2.5 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-outline-variant text-sm focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                          required
                        />
                      </div>

                      {/* Position */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Position <span className="text-error">*</span></label>
                        <select
                          value={formData.position}
                          onChange={(e) => setFormData({...formData, position: e.target.value})}
                          className="w-full px-3 py-2.5 bg-surface-container-low border-none rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select Position</option>
                          <option value="Senior Counsel">Senior Counsel</option>
                          <option value="Legal Analyst">Legal Analyst</option>
                          <option value="Admin Coordinator">Admin Coordinator</option>
                          <option value="Case Manager">Case Manager</option>
                          <option value="Senior Officer">Senior Officer</option>
                          <option value="Junior Officer">Junior Officer</option>
                        </select>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Phone <span className="text-outline-variant font-normal text-[10px]">(Opt)</span></label>
                        <input
                          type="tel"
                          placeholder="+91 00000 00000"
                          maxLength="20"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-3 py-2.5 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-outline-variant text-sm focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                        />
                      </div>

                      {/* Expertise Area - Tags */}
                      <div className="col-span-full space-y-1">
                        <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Expertise <span className="text-outline-variant font-normal text-[10px]">(Opt)</span></label>
                        <div className="flex flex-wrap gap-1.5 pt-2 pb-1">
                          {expertiseAreas.map((area, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium">
                              {area}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setExpertiseAreas(expertiseAreas.filter((_, i) => i !== index));
                                }}
                                className="ml-1.5 hover:opacity-70 transition-opacity"
                              >
                                <span className="material-symbols-outlined text-xs leading-none">close</span>
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            placeholder={expertiseAreas.length === 0 ? "e.g., Criminal Law" : ""}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                e.preventDefault();
                                setExpertiseAreas([...expertiseAreas, e.currentTarget.value.trim()]);
                                e.currentTarget.value = '';
                              }
                            }}
                            className="px-2.5 py-1 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 transition-all text-xs flex-grow min-w-[120px]"
                          />
                        </div>
                        <p className="text-[9px] text-outline-variant">Press Enter to add</p>
                      </div>
                    </div>

                    {/* Security Note */}
                    <div className="mt-5 p-2.5 bg-tertiary/5 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-tertiary flex-shrink-0 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span>
                        <div className="text-[9px] leading-tight text-tertiary">
                          <p className="font-bold uppercase tracking-widest">Security Note</p>
                          <p className="mt-0.5">All credentials are encrypted with AES-256.</p>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 pt-4 border-t border-outline-variant/20 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddStaffModal(false);
                          setFormData({
                            username: '',
                            password: '',
                            staff_name: '',
                            email: '',
                            position: '',
                            phone: '',
                            expertise_area: ''
                          });
                          setExpertiseAreas([]);
                          setAddStaffError('');
                        }}
                        className="flex-1 px-6 py-2.5 font-semibold text-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors border border-outline-variant/20"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addStaffLoading}
                        className="flex-1 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {addStaffLoading ? 'Creating...' : 'Create Staff'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Decorative Elements */}
                <div className="fixed top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
                <div className="fixed bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}





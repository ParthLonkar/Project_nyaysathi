import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api.js';

export default function StaffCaseDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    console.log('StaffCaseDetails ID from params:', id, 'Length:', id?.length);
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('staffToken');

      const response = await fetch(`${API_BASE_URL}/staff/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        const { complaint: data } = await response.json();
        setComplaint(data);
      } else {
        setError('Failed to load complaint details');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-slate-500">Loading complaint details...</div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-red-500">{error || 'Complaint not found'}</div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-slate-50 border-r border-slate-200/15 z-50">
        <div className="p-6">
          <h1 className="font-headline font-extrabold text-primary text-2xl tracking-tight">NyaySathi</h1>
          <p className="text-xs text-secondary font-medium mt-1">Legal Workspace</p>
        </div>
        <nav className="flex flex-col p-4 gap-y-2 flex-grow">
          <button
            type="button"
            onClick={() => navigate('/staff/dashboard')}
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50/50 hover:text-primary transition-all duration-300 rounded-lg group text-left"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/task')}
            className="flex items-center gap-3 px-4 py-3 bg-white text-primary font-bold rounded-lg shadow-sm transition-all duration-300 text-left"
          >
            <span className="material-symbols-outlined">assignment_turned_in</span>
            <span className="text-sm">My Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/profile')}
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50/50 hover:text-primary transition-all duration-300 rounded-lg group text-left"
          >
            <span className="material-symbols-outlined">description</span>
            <span className="text-sm font-medium">Documents</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/profile')}
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50/50 hover:text-primary transition-all duration-300 rounded-lg group text-left"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="mt-4 mx-2 bg-gradient-to-br from-primary to-primary-container text-white py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-[0.98] transition-transform">
            <span className="material-symbols-outlined text-sm">add</span>
            New Complaint
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100 mt-auto">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors w-full text-left">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-sm font-medium">Support</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/login')}
            className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="h-16 sticky top-0 bg-white/80 backdrop-blur-md z-40 flex justify-between items-center px-8 border-b border-slate-200/15">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
            <h2 className="font-headline font-bold text-xl text-primary uppercase tracking-tight">Case Details</h2>
            <span className="text-sm bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-mono font-bold ml-2">
              {complaint?.reference_id || `#${id?.slice(0, 8)}`}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
              <input className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" placeholder="Search workspace..." type="text" />
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-primary relative transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 h-2 w-2 bg-error rounded-full border-2 border-white"></span>
              </button>
              <button className="text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
              <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-primary-fixed ring-2 ring-primary-fixed/30">
                <div className="w-full h-full bg-primary-fixed/40 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1440px] mx-auto grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-2xl text-primary">{complaint?.title || 'Complaint Description'}</h3>
                  <p className="text-sm text-slate-500 mt-2">Reference ID: {complaint?.reference_id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  complaint?.priority === 'high' ? 'bg-error text-white' :
                  complaint?.priority === 'medium' ? 'bg-amber-400 text-amber-900' :
                  'bg-emerald-100 text-emerald-900'
                }`}>
                  {complaint?.priority || 'Medium'} Priority
                </span>
              </div>
              <p className="text-on-surface/80 leading-relaxed text-lg mb-6">
                {complaint?.description || 'No description available'}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{complaint?.category || 'General'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-medium text-slate-900 mt-1 capitalize">{complaint?.status?.replace(/_/g, ' ') || 'New'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Submitted</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{formatDate(complaint?.submitted_at)}</p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6 ml-2">
                <span className="material-symbols-outlined text-primary">folder_open</span>
                <h3 className="font-headline font-bold text-xl text-primary">Relevant Documents</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-md hover:bg-white border border-transparent hover:border-outline-variant/10">
                  <div className="h-12 w-12 bg-error-container flex items-center justify-center rounded-lg text-error">
                    <span className="material-symbols-outlined">picture_as_pdf</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-primary">Initial_Contract_AD992.pdf</p>
                    <p className="text-[11px] text-slate-400 font-medium">Uploaded Jan 12, 2024 � 2.4 MB</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
                <div className="group bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-md hover:bg-white border border-transparent hover:border-outline-variant/10">
                  <div className="h-12 w-12 bg-secondary-container flex items-center justify-center rounded-lg text-on-secondary-container">
                    <span className="material-symbols-outlined">image</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-primary">Site_Survey_Photo_01.jpg</p>
                    <p className="text-[11px] text-slate-400 font-medium">Uploaded Jan 12, 2024 � 4.1 MB</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
                <div className="group bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-md hover:bg-white border border-transparent hover:border-outline-variant/10">
                  <div className="h-12 w-12 bg-primary-fixed flex items-center justify-center rounded-lg text-on-primary-fixed">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-primary">Technical_Specs_Annexure_IV.docx</p>
                    <p className="text-[11px] text-slate-400 font-medium">Uploaded Jan 15, 2024 � 840 KB</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8 ml-2">
                <span className="material-symbols-outlined text-primary">history</span>
                <h3 className="font-headline font-bold text-xl text-primary">Process Timeline</h3>
              </div>
              <div className="relative space-y-8 pl-8">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
                <div className="relative">
                  <div className="absolute -left-[23px] h-4 w-4 rounded-full bg-primary ring-4 ring-white"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-primary">Case Verified & Assigned</p>
                      <p className="text-xs text-on-surface-variant mt-1">Assigned to Lead Investigator: Anjali Sharma</p>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Today, 09:12 AM</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[23px] h-4 w-4 rounded-full bg-slate-300 ring-4 ring-white"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Complaint Submitted</p>
                      <p className="text-xs text-on-surface-variant mt-1">Received via Web Portal</p>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Yesterday, 14:45 PM</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[23px] h-4 w-4 rounded-full bg-slate-300 ring-4 ring-white"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Initial Review Completed</p>
                      <p className="text-xs text-on-surface-variant mt-1">Automated validation check passed</p>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Jan 12, 11:30 AM</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <section className="bg-surface-container-highest/50 backdrop-blur rounded-xl p-6 border border-white/50">
              <h3 className="font-headline font-bold text-lg text-primary mb-6">Administrative Actions</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Current Status</label>
                  <div className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm font-medium shadow-sm capitalize">
                    {complaint?.status?.replace(/_/g, ' ') || 'New'}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Progress</label>
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">{complaint?.progress_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${complaint?.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">SLA Days Remaining</label>
                  <div className="text-lg font-bold text-primary">
                    {complaint?.sla_days || 30} days
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border-t-4 border-secondary-fixed">
              <h3 className="font-headline font-bold text-lg text-primary mb-6">Complaint Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed-dim">bookmark</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Category</p>
                    <p className="text-sm font-medium text-on-surface capitalize">{complaint?.category || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed-dim">schedule</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Submitted</p>
                    <p className="text-sm font-medium text-on-surface">{formatDate(complaint?.submitted_at)}</p>
                  </div>
                </div>
                {complaint?.location && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary-fixed-dim mt-1">location_on</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Location</p>
                      <p className="text-sm font-medium text-on-surface leading-snug">{complaint?.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="px-2 space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Created On</span>
                <span className="text-on-surface">Jan 10, 2024</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Jurisdiction</span>
                <span className="text-on-surface">Regional Court (North)</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Legal Code</span>
                <span className="text-on-surface">Section 44B (Contract)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

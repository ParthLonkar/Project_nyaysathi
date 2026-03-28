import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function StaffCaseDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

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
            <span className="text-sm bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-mono font-bold ml-2">#{id || 'NY-2024-8842'}</span>
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
                <h3 className="font-headline font-bold text-2xl text-primary">Complaint Description</h3>
                <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">High Priority</span>
              </div>
              <p className="text-on-surface/80 leading-relaxed text-lg mb-6">
                The complainant alleges a serious breach of contract regarding the digital infrastructure rollout in the northern sector. The project, initiated under Agreement #AD-992, has faced consistent delays and non-compliance with technical specifications outlined in Annexure IV. Primary concerns include the failure to meet load-bearing benchmarks and recurring system outages during peak hours.
              </p>
              <div className="bg-surface-container-low rounded-lg p-6 border-l-4 border-primary-fixed">
                <p className="text-sm font-medium text-primary mb-1">Impact Analysis</p>
                <p className="text-sm text-on-surface-variant">Estimated operational downtime: 142 hours. Financial variance: 18% above approved budget. Stakeholder sentiment remains critical.</p>
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
                    <p className="text-[11px] text-slate-400 font-medium">Uploaded Jan 12, 2024 • 2.4 MB</p>
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
                    <p className="text-[11px] text-slate-400 font-medium">Uploaded Jan 12, 2024 • 4.1 MB</p>
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
                    <p className="text-[11px] text-slate-400 font-medium">Uploaded Jan 15, 2024 • 840 KB</p>
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
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Update Case Status</label>
                  <div className="relative">
                    <select className="w-full bg-white border-none rounded-xl py-3 pl-4 pr-10 text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm cursor-pointer">
                      <option>In Progress</option>
                      <option>Under Review</option>
                      <option>Awaiting Complainant</option>
                      <option>Resolved</option>
                      <option>Dismissed</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Internal Remarks</label>
                  <textarea className="w-full bg-white border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm resize-none placeholder:text-slate-300" placeholder="Add confidential notes for the legal team..." rows="4"></textarea>
                </div>
                <button className="w-full py-3.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                  <span>Update Case Record</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border-t-4 border-secondary-fixed">
              <h3 className="font-headline font-bold text-lg text-primary mb-6">Complainant Info</h3>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <p className="font-bold text-primary">Rakesh Verma</p>
                  <p className="text-xs text-on-surface-variant">Director, Verity Infrastructure</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed-dim">mail</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Email Address</p>
                    <p className="text-sm font-medium text-on-surface">rakesh.verma@verity-infra.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed-dim">call</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Phone Number</p>
                    <p className="text-sm font-medium text-on-surface">+91 98221 00452</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed-dim mt-1">location_on</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Headquarters</p>
                    <p className="text-sm font-medium text-on-surface leading-snug">Tech Park East, Block 4-C, New Delhi, India 110025</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex gap-2">
                <button className="flex-grow py-2.5 bg-secondary-container text-on-secondary-container rounded-lg text-xs font-bold hover:bg-secondary-fixed transition-colors">Message User</button>
                <button className="p-2.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors">
                  <span className="material-symbols-outlined text-lg">more_horiz</span>
                </button>
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

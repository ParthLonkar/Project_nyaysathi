import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { complaintService } from '../services/complaint.service';
import GeneratedDocumentsPanel from '../components/GeneratedDocumentsPanel';

const REFERENCE_ID_REGEX = /^Ref-\d{4}-\d{6}$/;

const safeDate = (value) => {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not available';
  return parsed.toLocaleString();
};

const getStatusStyles = (status = '') => {
  const key = String(status).toLowerCase();
  const map = {
    new: 'bg-blue-100 text-blue-800',
    submitted: 'bg-blue-100 text-blue-800',
    routed: 'bg-indigo-100 text-indigo-800',
    received: 'bg-cyan-100 text-cyan-800',
    assigned: 'bg-violet-100 text-violet-800',
    in_review: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-amber-100 text-amber-800',
    processing: 'bg-amber-100 text-amber-800',
    escalated: 'bg-red-100 text-red-800',
    resolved: 'bg-emerald-100 text-emerald-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  return map[key] || 'bg-gray-100 text-gray-800';
};

const PipelineStages = [
  {
    icon: 'input',
    title: 'Intake',
    description: 'System validates documents and categorizes the legal domain of your complaint.',
  },
  {
    icon: 'psychology',
    title: 'AI Assessment',
    description: 'Neural engines extract core facts and identify potential legal violations instantly.',
  },
  {
    icon: 'analytics',
    title: 'Legal Analysis',
    description: 'Comparison against 100k+ precedents to determine the strength of your case.',
  },
  {
    icon: 'description',
    title: 'Doc Generation',
    description: 'Automated drafting of petitions and formal notices in professional legal format.',
  },
  {
    icon: 'verified_user',
    title: 'Compliance',
    description: 'Final check against current procedural codes and judicial standards.',
  },
  {
    icon: 'task_alt',
    title: 'Resolution',
    description: 'Filing submission completed or case-ready package delivered to user.',
    filled: true,
  },
];

export default function CaseTracking() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [referenceIdInput, setReferenceIdInput] = useState(complaintId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);

  const runTracking = async (rawRef) => {
    const ref = String(rawRef || '').trim();
    setError('');

    if (!REFERENCE_ID_REGEX.test(ref)) {
      setTrackedComplaint(null);
      setError('Please enter a valid reference ID in format Ref-2026-123456.');
      return;
    }

    try {
      setLoading(true);
      const response = await complaintService.trackByReferenceId(ref);
      const complaint = response?.complaint || null;
      setTrackedComplaint(complaint);
      navigate(`/track/${encodeURIComponent(ref)}`, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.error?.message || 'No complaint found for this reference ID.';
      setTrackedComplaint(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await runTracking(referenceIdInput);
  };

  const timeline = useMemo(() => {
    if (!trackedComplaint) return [];
    if (Array.isArray(trackedComplaint.timeline) && trackedComplaint.timeline.length > 0) {
      return trackedComplaint.timeline;
    }
    return [{
      status: trackedComplaint.status || 'new',
      note: trackedComplaint.latest_note || 'Complaint submitted successfully.',
      at: trackedComplaint.latest_update || trackedComplaint.created_at,
    }];
  }, [trackedComplaint]);

  return (
    <Layout>
      <main className="bg-surface min-h-screen">
        {/* Hero Section */}
        <section className="relative px-8 pt-24 pb-32 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary mb-6 tracking-tight">
              Track Your Complaint Journey
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-body">
              Monitor your AI-driven legal processing with absolute clarity. Transparency at every step, from initial intake to final resolution.
            </p>
          </div>
          {/* Decorative blur */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        </section>

        {/* Search Block */}
        <section className="px-8 -mt-20 relative z-20 mb-32">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={onSubmit} className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-2xl shadow-primary/5 flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  value={referenceIdInput}
                  onChange={(e) => setReferenceIdInput(e.target.value)}
                  placeholder="Enter Reference ID (e.g. Ref-2026-123456)"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface font-body"
                  type="text"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-lg font-headline font-bold hover:shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Tracking...' : 'Track Status'}
              </button>
            </form>
          </div>
        </section>

        {error && (
          <div className="px-8 mb-8 max-w-3xl mx-auto">
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
              <p className="text-red-700 font-semibold text-sm">{error}</p>
            </div>
          </div>
        )}

        {!trackedComplaint && !loading && (
          <>
            {/* Pipeline Section */}
            <section className="px-8 mt-24 mb-32 max-w-7xl mx-auto">
              <div className="mb-16">
                <h2 className="font-headline text-3xl font-bold text-on-surface mb-4">The NyaySathi Pipeline</h2>
                <p className="text-on-surface-variant font-body">Understand how our proprietary AI analyzes and processes your legal documents.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
                {/* Connector Line (Desktop) */}
                <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-outline-variant/30 z-0"></div>

                {PipelineStages.map((stage, index) => (
                  <div key={index} className="relative z-10 group">
                    <div className="bg-surface-container-low p-6 rounded-xl group-hover:bg-white group-hover:shadow-xl transition-all duration-300 h-full border-t-4 border-primary/20 group-hover:border-primary">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                        <span 
                          className="material-symbols-outlined text-primary"
                          style={stage.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          {stage.icon}
                        </span>
                      </div>
                      <h3 className="font-headline font-bold text-primary text-sm mb-2">{stage.title}</h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{stage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Trust & Security Section */}
            <section className="px-8 bg-surface-container-low py-24">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="font-headline text-3xl font-bold text-on-surface mb-4">Built on Trust and Precision</h2>
                  <p className="text-on-surface-variant font-body">Our platform operates under strict ethical AI guidelines and legal protocols.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  {/* Card 1 */}
                  <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
                    <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-secondary">update</span>
                    </div>
                    <h4 className="font-headline font-bold text-xl mb-3 text-on-surface">Real-time Updates</h4>
                    <p className="text-on-surface-variant font-body leading-relaxed text-sm">
                      No more waiting in the dark. Receive instant notifications via SMS or email the second our AI completes a processing phase.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
                    <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-secondary">visibility</span>
                    </div>
                    <h4 className="font-headline font-bold text-xl mb-3 text-on-surface">AI Transparency</h4>
                    <p className="text-on-surface-variant font-body leading-relaxed text-sm">
                      We provide "Explainable AI" logs. Click on any stage to see the specific legal reasoning and data points the system utilized.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
                    <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-secondary">gavel</span>
                    </div>
                    <h4 className="font-headline font-bold text-xl mb-3 text-on-surface">Judicial Compliance</h4>
                    <p className="text-on-surface-variant font-body leading-relaxed text-sm">
                      Every byte of data is processed in alignment with the High Court Digital Guidelines and Data Privacy Acts.
                    </p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl">enhanced_encryption</span>
                    <span className="font-headline font-bold text-sm tracking-widest uppercase">End-to-End Encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                    <span className="font-headline font-bold text-sm tracking-widest uppercase">ISO Certified AI</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl">policy</span>
                    <span className="font-headline font-bold text-sm tracking-widest uppercase">Legal Standards Verified</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {trackedComplaint && (
          <section className="px-8 max-w-7xl mx-auto pb-32">
            <div className="space-y-6">
              {/* Complaint Details Card */}
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <p className="text-sm text-on-surface-variant font-semibold">Reference ID</p>
                  <p className="font-mono font-bold text-primary bg-primary-fixed px-3 py-1 rounded text-sm break-all">
                    {trackedComplaint.reference_id}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold mb-0.5">Status</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusStyles(trackedComplaint.status)}`}>
                      {String(trackedComplaint.status || 'new').replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold mb-0.5">Category</p>
                    <p className="font-semibold text-on-surface text-sm">{trackedComplaint.category || 'general'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold mb-0.5">Priority</p>
                    <p className="font-semibold text-on-surface text-sm">{trackedComplaint.priority || 'medium'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 shadow-sm">
                <h3 className="text-base font-bold text-on-surface mb-3">Progress</h3>
                <div className="w-full bg-outline-variant/20 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, Math.min(100, Number(trackedComplaint.progress_percentage || 0)))}%` }}
                  />
                </div>
                <p className="text-xs text-on-surface-variant font-semibold">
                  {Math.max(0, Math.min(100, Number(trackedComplaint.progress_percentage || 0)))}% complete
                </p>

                <div className="mt-4 grid md:grid-cols-2 gap-2 text-xs">
                  <p><span className="font-semibold text-on-surface">Department:</span> {trackedComplaint.department || 'Pending routing'}</p>
                  <p><span className="font-semibold text-on-surface">Submitted:</span> {safeDate(trackedComplaint.submitted_at || trackedComplaint.created_at)}</p>
                  <p><span className="font-semibold text-on-surface">Last Update:</span> {safeDate(trackedComplaint.latest_update)}</p>
                  <p><span className="font-semibold text-on-surface">Created:</span> {safeDate(trackedComplaint.created_at)}</p>
                </div>

                <p className="mt-4 text-xs text-on-surface">
                  <span className="font-semibold">Summary:</span> {trackedComplaint.summary || 'No summary available yet.'}
                </p>
                {trackedComplaint.latest_note && (
                  <p className="mt-2 text-xs text-on-surface">
                    <span className="font-semibold">Latest Note:</span> {trackedComplaint.latest_note}
                  </p>
                )}
              </div>

              {/* Timeline Card */}
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 shadow-sm">
                <h3 className="text-base font-bold text-on-surface mb-3">Timeline</h3>
                <div className="space-y-2">
                  {timeline.map((entry, index) => (
                    <div key={`${entry.status}-${entry.at || index}`} className="border border-outline-variant/20 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-on-surface capitalize text-sm">{String(entry.status || 'updated').replace('_', ' ')}</p>
                        <p className="text-[10px] text-on-surface-variant">{safeDate(entry.at)}</p>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">{entry.note || 'Status updated.'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Panel */}
              <GeneratedDocumentsPanel
                documents={trackedComplaint.documents || []}
                title="Download Documents"
              />
            </div>
          </section>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 w-full flex md:hidden justify-around items-center px-4 py-3 bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 rounded-t-2xl">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">home</span>
            <span className="font-body text-[10px] uppercase tracking-widest font-bold">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center text-primary scale-110">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
            <span className="font-body text-[10px] uppercase tracking-widest font-bold">Track</span>
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">description</span>
            <span className="font-body text-[10px] uppercase tracking-widest font-bold">Docs</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span className="font-body text-[10px] uppercase tracking-widest font-bold">Profile</span>
          </button>
        </nav>
      </main>
    </Layout>
  );
}

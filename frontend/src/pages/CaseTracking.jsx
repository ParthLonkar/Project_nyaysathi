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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide mb-3">
              Citizen Tracking
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-blue-900">Track Complaint by Reference ID</h1>
            <p className="text-gray-600 mt-3">Enter your reference ID to check live complaint progress and latest updates.</p>
          </div>

          <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm mb-6">
            <label htmlFor="referenceId" className="block text-sm font-bold text-gray-800 mb-2">
              Reference ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="referenceId"
                value={referenceIdInput}
                onChange={(e) => setReferenceIdInput(e.target.value)}
                placeholder="Ref-2026-123456"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-700 text-white font-bold px-6 py-3 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Tracking...' : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {!loading && !trackedComplaint && !error && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">
              Enter your reference ID above to view your complaint status.
            </div>
          )}

          {trackedComplaint && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <p className="text-sm text-gray-600">Reference ID</p>
                  <p className="font-mono font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg break-all">
                    {trackedComplaint.reference_id}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusStyles(trackedComplaint.status)}`}>
                      {String(trackedComplaint.status || 'new').replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Category</p>
                    <p className="font-semibold text-gray-900">{trackedComplaint.category || 'general'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Priority</p>
                    <p className="font-semibold text-gray-900">{trackedComplaint.priority || 'medium'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-3">Progress</h2>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, Math.min(100, Number(trackedComplaint.progress_percentage || 0)))}%` }}
                  />
                </div>
                <p className="text-sm text-gray-700 mt-2 font-semibold">
                  {Math.max(0, Math.min(100, Number(trackedComplaint.progress_percentage || 0)))}% complete
                </p>
                <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
                  <p><span className="font-semibold text-gray-700">Department:</span> {trackedComplaint.department || 'Pending routing'}</p>
                  <p><span className="font-semibold text-gray-700">Submitted:</span> {safeDate(trackedComplaint.submitted_at || trackedComplaint.created_at)}</p>
                  <p><span className="font-semibold text-gray-700">Last Update:</span> {safeDate(trackedComplaint.latest_update)}</p>
                  <p><span className="font-semibold text-gray-700">Created:</span> {safeDate(trackedComplaint.created_at)}</p>
                </div>
                <p className="mt-4 text-sm text-gray-800">
                  <span className="font-semibold text-gray-700">Summary:</span> {trackedComplaint.summary || 'No summary available yet.'}
                </p>
                {trackedComplaint.latest_note && (
                  <p className="mt-2 text-sm text-gray-800">
                    <span className="font-semibold text-gray-700">Latest Note:</span> {trackedComplaint.latest_note}
                  </p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-4">Timeline</h2>
                <div className="space-y-3">
                  {timeline.map((entry, index) => (
                    <div key={`${entry.status}-${entry.at || index}`} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-gray-900 capitalize">{String(entry.status || 'updated').replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{safeDate(entry.at)}</p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{entry.note || 'Status updated.'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <GeneratedDocumentsPanel
                documents={trackedComplaint.documents || []}
                title="Download Documents"
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

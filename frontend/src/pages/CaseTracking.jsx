import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { MessageSquare, Star } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

function safeDate(value) {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Not available' : parsed.toLocaleString();
}

function pickRouting(complaint = {}) {
  const ai = complaint.ai_analysis || {};
  const routing = ai.routing_info || ai.routing || complaint.routing_info || {};
  return {
    department: routing.departmentName || routing.department_name || ai.department || complaint.department || 'Pending routing',
    departmentCode: routing.departmentCode || routing.department_code || null,
    category: ai.category || complaint.category || routing.category || 'general',
    priority: routing.priority || ai.priority || complaint.priority || 'medium',
    urgency: routing.priorityScore || null,
    strategy: ai.legal_strategy || routing.priorityReason || 'Strategy will be updated after processing.',
    confidence: ai.confidence || routing.confidence || null,
    recommendedAuthority: routing.departmentEmail || null,
  };
}

function computeProgress(complaint, history) {
  if (typeof complaint?.progress_percentage === 'number') return complaint.progress_percentage;
  const steps = ['new', 'routed', 'received', 'assigned', 'in_progress', 'resolved'];
  const current = String(complaint?.status || 'new').toLowerCase();
  const index = Math.max(0, steps.indexOf(current));
  const fromHistory = Math.max(index + 1, Array.isArray(history) ? history.length : 1);
  return Math.min(100, Math.round((fromHistory / steps.length) * 100));
}

function buildTimeline(complaint, history) {
  if (Array.isArray(history) && history.length > 0) {
    return history
      .slice()
      .reverse()
      .map((item) => ({
        status: item.new_status || complaint.status || 'new',
        date: safeDate(item.created_at),
        description: item.notes || `Status changed to ${item.new_status || complaint.status || 'new'}`,
      }));
  }

  return [
    {
      status: complaint.status || 'new',
      date: safeDate(complaint.updated_at || complaint.created_at || complaint.submitted_at),
      description: 'Complaint record available. Detailed timeline will appear after status transitions.',
    },
  ];
}

export default function CaseTracking() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTracking = async () => {
      if (!complaintId) {
        setError('Complaint reference ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/status/${complaintId}/status`, {
          credentials: 'include',
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Unable to fetch complaint tracking data.');
        }

        const payload = await response.json();
        setComplaint(payload.complaint || null);
        setHistory(Array.isArray(payload.statusHistory) ? payload.statusHistory : []);
        setOfficer(payload.assignedOfficer || null);
      } catch (err) {
        setError(err.message || 'Failed to load complaint details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [complaintId]);

  const routing = useMemo(() => pickRouting(complaint || {}), [complaint]);
  const timeline = useMemo(() => buildTimeline(complaint || {}, history), [complaint, history]);
  const progress = useMemo(() => computeProgress(complaint || {}, history), [complaint, history]);

  const getStatusColor = (status) => {
    const key = String(status || '').toLowerCase();
    const colors = {
      new: 'bg-blue-100 text-blue-900',
      routed: 'bg-indigo-100 text-indigo-900',
      received: 'bg-cyan-100 text-cyan-900',
      assigned: 'bg-violet-100 text-violet-900',
      in_progress: 'bg-amber-100 text-amber-900',
      processing: 'bg-amber-100 text-amber-900',
      escalated: 'bg-red-100 text-red-900',
      resolved: 'bg-green-100 text-green-900',
      closed: 'bg-gray-100 text-gray-900',
    };
    return colors[key] || 'bg-gray-100 text-gray-900';
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-section flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 font-semibold">Fetching real-time complaint status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !complaint) {
    return (
      <Layout>
        <div className="page-section bg-gradient-to-b from-red-50 to-white">
          <div className="container-lg text-center">
            <h1 className="section-header mb-4 text-red-900">Complaint Not Found</h1>
            <p className="text-lg text-gray-700 mb-8">{error || 'No complaint found for this reference ID.'}</p>
            <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
          </div>
        </div>
      </Layout>
    );
  }

  const ai = complaint.ai_analysis || {};
  const citizenUpdate = ai.citizen_update || 'Your complaint is recorded and under process.';

  return (
    <Layout>
      <div className="page-section bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="container-lg">
          <div className="mb-10">
            <div className="section-badge">Track Complaint</div>
            <h1 className="section-header">{complaint.title || 'Complaint'}</h1>
            <p className="text-lg text-gray-600 mt-3">
              Reference ID: <span className="font-mono font-black text-blue-900 bg-blue-100 px-3 py-1 rounded-lg break-all">{complaint.id}</span>
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="card p-6">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-2">Current Status</p>
              <p className={`inline-block px-3 py-1 rounded-lg font-bold ${getStatusColor(complaint.status)}`}>
                {String(complaint.status || 'new').replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-2">Days Elapsed</p>
              <p className="text-3xl font-black text-blue-900">{complaint.daysPassed ?? 0}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-2">Priority</p>
              <p className="text-2xl font-black text-orange-600">{String(routing.priority).toUpperCase()}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-2">Assigned Officer</p>
              <p className="text-sm font-bold text-gray-900">{officer?.name || 'Not assigned yet'}</p>
            </div>
          </div>

          <div className="card p-8 mb-10">
            <div className="flex justify-between items-center mb-3">
              <p className="font-black text-xl text-gray-900">Case Progress</p>
              <p className="font-black text-2xl text-blue-600">{progress}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-gray-700 mt-4 bg-blue-50 p-3 rounded-lg">{citizenUpdate}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="card p-8">
              <h3 className="text-xl font-black text-gray-900 mb-5">Routing and Analysis</h3>
              <div className="space-y-3 text-sm">
                <p><span className="font-bold text-gray-700">Detected Department:</span> {routing.department}</p>
                <p><span className="font-bold text-gray-700">Department Code:</span> {routing.departmentCode || 'Not available'}</p>
                <p><span className="font-bold text-gray-700">Category/Domain:</span> {routing.category}</p>
                <p><span className="font-bold text-gray-700">Urgency Score:</span> {routing.urgency ?? 'Not available'}</p>
                <p><span className="font-bold text-gray-700">Recommended Filing Path:</span> {routing.strategy}</p>
                <p><span className="font-bold text-gray-700">Recommended Authority:</span> {routing.recommendedAuthority || 'Not available'}</p>
                <p><span className="font-bold text-gray-700">Confidence:</span> {routing.confidence ?? 'Not available'}</p>
              </div>
            </div>

            <div className="card p-8">
              <h3 className="text-xl font-black text-gray-900 mb-5">Complaint Context</h3>
              <div className="space-y-3 text-sm">
                <p><span className="font-bold text-gray-700">Summary:</span> {ai.summary || complaint.description || 'No summary available yet.'}</p>
                <p><span className="font-bold text-gray-700">Location:</span> {complaint.location || 'Not provided'}</p>
                <p><span className="font-bold text-gray-700">Submitted:</span> {safeDate(complaint.submitted_at || complaint.created_at)}</p>
                <p><span className="font-bold text-gray-700">Last Updated:</span> {safeDate(complaint.updated_at)}</p>
                <p><span className="font-bold text-gray-700">Escalation Risk:</span> {ai.escalation_risk || 'Not available'}</p>
              </div>
            </div>
          </div>

          <div className="card p-8 mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Status Timeline</h2>
            <div className="space-y-4">
              {timeline.map((entry, index) => (
                <div key={`${entry.status}-${index}`} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold text-gray-900 capitalize">{String(entry.status).replace('_', ' ')}</p>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">{entry.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{entry.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <button className="btn-primary py-4 text-lg font-black flex items-center justify-center gap-2" type="button">
              <MessageSquare className="w-5 h-5" /> Request Update
            </button>
            <button className="btn-secondary py-4 text-lg font-black flex items-center justify-center gap-2" type="button">
              <Star className="w-5 h-5" /> Rate Resolution
            </button>
            <button onClick={() => navigate('/')} className="btn-outline py-4 text-lg font-black" type="button">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

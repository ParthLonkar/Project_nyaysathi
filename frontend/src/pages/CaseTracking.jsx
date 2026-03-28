import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Download, MessageSquare, Star } from 'lucide-react';

export default function CaseTracking() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mockComplaint = {
    id: complaintId,
    status: 'in_progress',
    title: 'Water leakage near my street',
    category: 'Infrastructure',
    department: 'Municipal Water Division',
    submitted: '2026-03-20',
    updated: '2026-03-28',
    officer: 'Officer Rajesh Kumar',
    sla: 30,
    daysPassed: 8,
    priority: 'high',
    progressPercentage: 60,
    statusHistory: [
      { status: 'submitted', date: '2026-03-20', description: 'Complaint submitted' },
      { status: 'routed', date: '2026-03-20', description: 'Routed to department' },
      { status: 'received', date: '2026-03-21', description: 'Department received' },
      { status: 'assigned', date: '2026-03-22', description: 'Assigned to officer' },
      { status: 'in_progress', date: '2026-03-25', description: 'Action in progress' },
    ],
    attachments: [
      { name: 'water_leak_photo.jpg', size: '2.3 MB', type: 'image' },
    ],
    nextAction: 'Field inspection scheduled for 30-March-2026',
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      if (complaintId) {
        setComplaint(mockComplaint);
      } else {
        setError('Complaint ID not found');
      }
      setLoading(false);
    }, 500);
  }, [complaintId]);

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-900',
      routed: 'bg-purple-100 text-purple-900',
      received: 'bg-cyan-100 text-cyan-900',
      assigned: 'bg-indigo-100 text-indigo-900',
      in_review: 'bg-yellow-100 text-yellow-900',
      in_progress: 'bg-orange-100 text-orange-900',
      resolved: 'bg-green-100 text-green-900',
      closed: 'bg-gray-100 text-gray-900',
    };
    return colors[status] || 'bg-gray-100 text-gray-900';
  };

  const getStatusIcon = (status) => {
    const icons = {
      submitted: '✅',
      routed: '📋',
      received: '📥',
      assigned: '👤',
      in_review: '🔍',
      in_progress: '⚙️',
      resolved: '✓',
      closed: '🔐',
    };
    return icons[status] || '📍';
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-section flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 font-semibold">Loading complaint details...</p>
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
            <div className="text-6xl mb-6">❌</div>
            <h1 className="section-header mb-4 text-red-900">Complaint Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">{error || 'The complaint ID you entered was not found.'}</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-section bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="container-lg">
          {/* Header */}
          <div className="mb-12">
            <div className="section-badge">📊 Track Your Complaint</div>
            <h1 className="section-header">{complaint.title}</h1>
            <p className="text-lg text-gray-600 mt-4">
              Reference ID: <span className="font-mono font-black text-blue-900 bg-blue-100 px-3 py-1 rounded-lg">{complaint.id}</span>
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="card p-8">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-3">Current Status</p>
              <p className={`inline-block px-4 py-2 rounded-xl font-bold text-lg ${getStatusColor(complaint.status)}`}>
                {getStatusIcon(complaint.status)} {complaint.status.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div className="card p-8">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-3">Days Elapsed</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-blue-900">{complaint.daysPassed}</p>
                <p className="text-gray-600 font-semibold">/ {complaint.sla}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">Days</p>
            </div>
            <div className="card p-8">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-3">Priority Level</p>
              <p className="text-3xl font-black text-orange-600">🔥 {complaint.priority.toUpperCase()}</p>
            </div>
            <div className="card p-8">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-3">Assigned Officer</p>
              <p className="text-lg font-bold text-gray-900">{complaint.officer}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card p-10 shadow-xl mb-12">
            <div className="flex justify-between items-center mb-4">
              <p className="font-black text-xl text-gray-900">Overall Progress</p>
              <p className="font-black text-3xl text-blue-600">{complaint.progressPercentage}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden border-2 border-gray-300">
              <div
                className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-600 h-full rounded-full transition-all duration-700 shadow-lg"
                style={{ width: `${complaint.progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-base text-gray-700 mt-6 font-semibold bg-blue-50 p-4 rounded-lg">✨ {complaint.nextAction}</p>
          </div>

          {/* Status Timeline */}
          <div className="card p-10 shadow-xl mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-10">📅 Status Timeline</h2>
            <div className="space-y-8">
              {complaint.statusHistory.map((entry, index) => (
                <div key={index} className="flex gap-6">
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full ${getStatusColor(entry.status)} flex items-center justify-center text-2xl font-bold shadow-lg`}>
                      {getStatusIcon(entry.status)}
                    </div>
                    {index < complaint.statusHistory.length - 1 && (
                      <div className="w-1.5 h-20 bg-gradient-to-b from-blue-400 to-gray-200 mt-4"></div>
                    )}
                  </div>
                  {/* Timeline Content */}
                  <div className="pt-2 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-black text-lg text-gray-900 capitalize">{entry.status.replace('_', ' ')}</p>
                      <span className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full">{entry.date}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complaint Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="card p-10">
              <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <span className="text-3xl">📋</span> Complaint Details
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-2">Category</p>
                  <p className="text-lg text-gray-900 font-bold">{complaint.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-2">Department</p>
                  <p className="text-lg text-gray-900 font-bold">{complaint.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-2">Submitted Date</p>
                  <p className="text-lg text-gray-900 font-bold">{complaint.submitted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-2">Last Updated</p>
                  <p className="text-lg text-gray-900 font-bold">{complaint.updated}</p>
                </div>
              </div>
            </div>

            <div className="card p-10">
              <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <span className="text-3xl">📎</span> Attachments
              </h3>
              <div className="space-y-4">
                {complaint.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">📄</span>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{attachment.name}</p>
                        <p className="text-sm text-gray-600 font-semibold">{attachment.size}</p>
                      </div>
                    </div>
                    <button className="btn-secondary flex items-center gap-2 py-2 px-4">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Response Section */}
          <div className="card-premium p-12 shadow-2xl mb-12 border-2 border-green-400">
            <h3 className="text-2xl font-black text-green-900 mb-8 flex items-center gap-2">
              <span className="text-3xl">🏛️</span> Department Action
            </h3>
            <div className="bg-white rounded-xl p-8 mb-8 border-2 border-green-200">
              <p className="font-bold text-lg text-gray-900 mb-3">Latest Update from Department:</p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Field inspection team has been mobilized. Site visit will happen on 30-March-2026. Repair work will begin immediately after inspection.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <p className="text-sm text-green-900 font-bold uppercase tracking-widest mb-3">Expected Completion</p>
                <p className="text-4xl font-black text-green-700">2026-04-30</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <p className="text-sm text-green-900 font-bold uppercase tracking-widest mb-3">Assigned Response Officer</p>
                <p className="text-2xl font-bold text-green-900">Rajesh Kumar</p>
                <p className="text-sm text-green-700 font-semibold mt-2">Dept. of Municipal Services</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <button className="btn-primary py-4 text-lg font-black flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Send Update Request
            </button>
            <button className="btn-secondary py-4 text-lg font-black flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              Rate Department
            </button>
            <button onClick={() => navigate('/')} className="btn-outline py-4 text-lg font-black">
              ← Back to Home
            </button>
          </div>

          {/* Support Card */}
          <div className="card-premium p-10 text-center border-2 border-blue-400">
            <p className="text-xl text-gray-700 font-semibold mb-4">Need help or have questions?</p>
            <a href="tel:+918000000000" className="text-2xl font-black text-blue-900 hover:text-blue-700 transition-colors inline-block">
              📞 Call Support: 1800-NYAY-SAT
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

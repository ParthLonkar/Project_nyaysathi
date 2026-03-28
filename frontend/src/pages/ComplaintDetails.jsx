import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { complaintService } from '../services/complaint.service';
import GeneratedDocumentsPanel from '../components/GeneratedDocumentsPanel';

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
    } catch (err) {
      setError('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-900',
      'processing': 'bg-orange-100 text-orange-900',
      'escalated': 'bg-red-100 text-red-900',
      'resolved': 'bg-green-100 text-green-900',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-900';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-900',
      'medium': 'bg-yellow-100 text-yellow-900',
      'low': 'bg-green-100 text-green-900',
    };
    return colors[priority?.toLowerCase()] || 'bg-gray-100 text-gray-900';
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
          <div className="container-lg">
            <div className="card p-12 border-2 border-red-300">
              <p className="text-center text-lg text-red-700 font-bold">{error || 'Complaint not found'}</p>
              <button onClick={() => navigate('/dashboard')} className="btn-primary mx-auto mt-6">
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const ai = complaint.ai_analysis || {};
  const displayCategory = ai.category || complaint.category || 'general';
  const displayDepartment = ai.department || complaint.department || 'Municipal Grievance Cell';
  const displayPriority = ai.priority || complaint.priority || 'medium';
  const displaySummary = ai.summary || 'AI summary not available yet.';
  const persistedDocuments = complaint.documents || ai.documents || [];
  const inlinePdfDocuments = [
    ai?.complaint_pdf
      ? {
        document_type: 'complaint_pdf',
        file_name: `Complaint_Letter_${complaint.reference_id || complaint.id || 'draft'}.pdf`,
        download_url: `data:application/pdf;base64,${ai.complaint_pdf}`,
      }
      : null,
    ai?.rti_pdf
      ? {
        document_type: 'rti_pdf',
        file_name: `RTI_Draft_${complaint.reference_id || complaint.id || 'draft'}.pdf`,
        download_url: `data:application/pdf;base64,${ai.rti_pdf}`,
      }
      : null,
  ].filter(Boolean);
  const documents = persistedDocuments.length > 0 ? persistedDocuments : inlinePdfDocuments;
  const complaintDraftText = ai.complaint_draft || '';
  const rtiDraftText = ai.rti_draft || '';
  const safeLastUpdated = complaint.submitted_at || complaint.created_at || null;

  return (
    <Layout>
      <div className="page-section bg-gradient-to-b from-blue-50 to-white">
        <div className="container-lg">
          {/* Header */}
          <div className="mb-12">
            <button onClick={() => navigate('/dashboard')} className="text-blue-900 font-bold mb-6 hover:text-blue-700 transition-colors">
              ← Back to Dashboard
            </button>
            <div className="flex justify-between items-start gap-6 mb-6">
              <div className="flex-1">
                <h1 className="section-header mb-4">{complaint.title}</h1>
              </div>
              <span className={`badge px-6 py-2 text-lg font-black whitespace-nowrap ${getStatusColor(complaint.status)}`}>
                {complaint.status?.toUpperCase().replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="card p-8">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-3">Category</p>
              <p className="text-2xl font-black text-gray-900 capitalize">{displayCategory}</p>
            </div>
            <div className="card p-8">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-3">Priority</p>
              <span className={`badge px-3 py-1 text-lg font-black ${getPriorityColor(displayPriority)}`}>
                {displayPriority.toUpperCase()}
              </span>
            </div>
            <div className="card p-8">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-3">Department</p>
              <p className="text-sm font-bold text-gray-900">{displayDepartment}</p>
            </div>
            <div className="card p-8">
              <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-3">Last Updated</p>
              <p className="text-sm font-bold text-gray-900">
                {safeLastUpdated ? new Date(safeLastUpdated).toLocaleDateString() : 'Not available'}
              </p>
            </div>
          </div>

          <div className="card p-8 mb-12">
            <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mb-3">Summary</p>
            <p className="text-lg text-gray-800 leading-relaxed">{displaySummary}</p>
          </div>

          {/* Description */}
          <div className="card p-10 shadow-lg mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="text-3xl">📝</span> Description
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">{complaint.description}</p>
          </div>

          <div className="mb-12">
            <GeneratedDocumentsPanel
              documents={documents}
              complaintDraftText={complaintDraftText}
              rtiDraftText={rtiDraftText}
              title="Generated Documents"
            />
          </div>

          {/* AI Analysis */}
          {complaint.ai_analysis && (
            <div className="card-premium p-10 shadow-xl mb-12 border-2 border-blue-300">
              <h2 className="text-3xl font-black text-blue-900 mb-8 flex items-center gap-3">
                <span className="text-3xl">🧠</span> AI Legal Analysis
              </h2>
              <div className="bg-white rounded-xl p-8 font-mono text-sm overflow-auto max-h-96 border border-gray-300">
                <pre className="whitespace-pre-wrap break-words text-gray-700">{JSON.stringify(complaint.ai_analysis, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-6 justify-center">
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              ← Back to Dashboard
            </button>
            <button className="btn-secondary">
              📋 Download Report
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

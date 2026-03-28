import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { CheckCircle } from 'lucide-react';
import GeneratedDocumentsPanel from '../components/GeneratedDocumentsPanel';

function formatDate(value) {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Not available' : parsed.toLocaleString();
}

export default function SubmissionConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [complaintData, setComplaintData] = useState(null);

  useEffect(() => {
    if (location.state?.complaint) {
      setComplaintData(location.state.complaint);
      return;
    }
    navigate('/submit');
  }, [location, navigate]);

  const complaintId = complaintData?.complaintId || null;
  const ai = complaintData?.aiResult || {};
  const responseDocuments = complaintData?.documents || complaintData?.rawComplaint?.documents || [];
  const inlinePdfDocuments = [
    ai?.complaint_pdf
      ? {
        document_type: 'complaint_pdf',
        file_name: `Complaint_Letter_${complaintId || 'draft'}.pdf`,
        download_url: `data:application/pdf;base64,${ai.complaint_pdf}`,
      }
      : null,
    ai?.rti_pdf
      ? {
        document_type: 'rti_pdf',
        file_name: `RTI_Draft_${complaintId || 'draft'}.pdf`,
        download_url: `data:application/pdf;base64,${ai.rti_pdf}`,
      }
      : null,
  ].filter(Boolean);
  const documents = responseDocuments.length > 0 ? responseDocuments : inlinePdfDocuments;

  const complaintDraftText = ai?.complaint_draft || '';
  const rtiDraftText = ai?.rti_draft || '';

  const liveInsights = useMemo(() => {
    return {
      department: ai.department || complaintData?.rawComplaint?.department || 'Pending department routing',
      category: ai.category || complaintData?.rawComplaint?.category || 'general',
      priority: ai.priority || complaintData?.rawComplaint?.priority || 'medium',
      strategy: ai.legal_strategy || 'Legal strategy will be updated after complete processing.',
      summary: ai.summary || complaintData?.complaintText || 'No summary available yet.',
    };
  }, [ai, complaintData]);

  if (!complaintData) {
    return (
      <Layout>
        <div className="page-section flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Loading confirmation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-section bg-gradient-to-b from-green-50 via-blue-50/30 to-white">
        <div className="container-lg">
          <div className="flex justify-center mb-10">
            <div className="w-24 h-24 rounded-full bg-white shadow-xl border-4 border-green-200 flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-green-600" strokeWidth={1.6} />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="section-header mb-3 text-green-900">Complaint Submitted Successfully</h1>
            <p className="section-subheader">Your complaint is saved and processing has started.</p>
          </div>

          <div className="card-premium p-10 mb-10 border-2 border-green-300">
            <p className="text-blue-700 mb-3 font-bold text-sm uppercase tracking-widest text-center">Complaint Reference ID</p>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-black tracking-wide font-mono text-blue-900 bg-white p-4 rounded-xl inline-block border-2 border-blue-200 break-all">
                {complaintId || 'Not available'}
              </div>
              <p className="text-blue-700 text-sm mt-3">Use this reference ID in the Track Complaint section.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-blue-200 mt-6">
              <button
                onClick={() => complaintId && navigator.clipboard.writeText(complaintId)}
                disabled={!complaintId}
                className="btn-primary disabled:opacity-50"
              >
                Copy Reference ID
              </button>
              <button onClick={() => window.print()} className="btn-secondary">Print Confirmation</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="card p-8">
              <h3 className="text-xl font-black text-gray-900 mb-6">Submitted Details</h3>
              <div className="space-y-4 text-sm">
                <p><span className="font-bold text-gray-700">Submitted At:</span> {formatDate(complaintData.submittedAt)}</p>
                <p><span className="font-bold text-gray-700">Name:</span> {complaintData.name || 'Not provided'}</p>
                <p><span className="font-bold text-gray-700">Phone:</span> {complaintData.phone || 'Not provided'}</p>
                <p><span className="font-bold text-gray-700">Location:</span> {complaintData.location || 'Not provided'}</p>
                <p><span className="font-bold text-gray-700">Attachments:</span> {complaintData.attachments?.length || 0}</p>
              </div>
            </div>

            <div className="card p-8">
              <h3 className="text-xl font-black text-gray-900 mb-6">Initial Agent Output</h3>
              <div className="space-y-3 text-sm">
                <p><span className="font-bold text-gray-700">Department:</span> {liveInsights.department}</p>
                <p><span className="font-bold text-gray-700">Category:</span> {liveInsights.category}</p>
                <p><span className="font-bold text-gray-700">Priority:</span> {String(liveInsights.priority).toUpperCase()}</p>
                <p><span className="font-bold text-gray-700">Legal Strategy:</span> {liveInsights.strategy}</p>
                <p><span className="font-bold text-gray-700">Summary:</span> {liveInsights.summary}</p>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <GeneratedDocumentsPanel
              documents={documents}
              complaintDraftText={complaintDraftText}
              rtiDraftText={rtiDraftText}
              title="Generated Documents"
            />
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mt-4">
              <p className="text-blue-900 font-semibold text-sm">
                Citizen Update: {ai?.citizen_update || 'Your complaint was routed to the concerned department.'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => complaintId && navigate(`/track/${complaintId}`)}
              disabled={!complaintId}
              className="btn-primary text-lg font-black py-4 disabled:opacity-50"
            >
              Track This Complaint
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary text-lg font-black py-4">
              View Dashboard
            </button>
            <button onClick={() => navigate('/')} className="btn-outline text-lg font-black py-4">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

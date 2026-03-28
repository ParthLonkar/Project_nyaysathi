import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { complaintService } from '../services/complaint.service';

function readWorkflow(complaint) {
  const ai = complaint?.ai_analysis || {};
  const routing = ai.routing_info || ai.routing || {};

  return {
    department: routing.departmentName || ai.department || 'Pending routing',
    departmentCode: routing.departmentCode || routing.department_code || '-',
    priorityScore: routing.priorityScore || '-',
    strategy: ai.legal_strategy || 'Strategy pending AI output',
    summary: ai.summary || 'Summary pending AI output',
    actions: ai.recommended_actions || [],
    escalation: ai.escalation_risk || 'Not evaluated',
    sla: routing.sla || '-',
  };
}

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
      new: 'bg-blue-100 text-blue-900',
      routed: 'bg-indigo-100 text-indigo-900',
      processing: 'bg-orange-100 text-orange-900',
      escalated: 'bg-red-100 text-red-900',
      resolved: 'bg-green-100 text-green-900',
    };
    return colors[(status || '').toLowerCase()] || 'bg-gray-100 text-gray-900';
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
                ? Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const wf = readWorkflow(complaint);

  return (
    <Layout>
      <div className="page-section bg-gradient-to-b from-blue-50 to-white">
        <div className="container-lg space-y-8">
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1">
              <button onClick={() => navigate('/dashboard')} className="text-blue-900 font-bold mb-4 hover:text-blue-700 transition-colors">
                ? Back to Dashboard
              </button>
              <h1 className="section-header mb-2">{complaint.title}</h1>
              <p className="text-gray-600">Complaint ID: {complaint.id}</p>
            </div>
            <span className={`badge px-6 py-2 text-lg font-black whitespace-nowrap ${getStatusColor(complaint.status)}`}>
              {(complaint.status || 'new').toUpperCase().replace('_', ' ')}
            </span>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="card p-6"><p className="text-xs font-bold text-gray-500 uppercase">Category</p><p className="text-xl font-black text-gray-900">{complaint.category}</p></div>
            <div className="card p-6"><p className="text-xs font-bold text-gray-500 uppercase">Department</p><p className="text-xl font-black text-gray-900">{wf.department}</p></div>
            <div className="card p-6"><p className="text-xs font-bold text-gray-500 uppercase">Priority</p><p className="text-xl font-black text-gray-900 uppercase">{complaint.priority}</p></div>
            <div className="card p-6"><p className="text-xs font-bold text-gray-500 uppercase">SLA (Days)</p><p className="text-xl font-black text-gray-900">{wf.sla}</p></div>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Complaint Description</h2>
            <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
          </div>

          <div className="card p-8 border-2 border-blue-200 bg-blue-50/40">
            <h2 className="text-2xl font-black text-blue-900 mb-4">AI Workflow Output</h2>
            <p className="text-sm text-blue-900 mb-2"><strong>Department Code:</strong> {wf.departmentCode}</p>
            <p className="text-sm text-blue-900 mb-2"><strong>Priority Score:</strong> {wf.priorityScore}</p>
            <p className="text-sm text-blue-900 mb-2"><strong>Legal Strategy:</strong> {wf.strategy}</p>
            <p className="text-sm text-blue-900 mb-4"><strong>Summary:</strong> {wf.summary}</p>
            <p className="text-sm text-blue-900 mb-2"><strong>Escalation Risk:</strong> {wf.escalation}</p>
            <div>
              <p className="text-sm font-bold text-blue-900 mb-2">Recommended Actions</p>
              <ul className="list-disc ml-5 text-sm text-blue-900 space-y-1">
                {wf.actions.length > 0 ? wf.actions.map((item, idx) => <li key={`${idx}-${item}`}>{item}</li>) : <li>Actions will appear after processing.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

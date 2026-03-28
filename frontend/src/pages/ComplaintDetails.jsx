import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { complaintService } from '../services/complaint.service';

export default function ComplaintDetails() {
  const { id } = useParams();
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

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="max-w-4xl mx-auto p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  if (!complaint) return <div className="text-center py-12">Complaint not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-4xl font-bold text-gray-900">{complaint.title}</h1>
            <span className={`px-4 py-2 rounded-full text-white font-semibold ${
              complaint.status === 'resolved' ? 'bg-green-500' :
              complaint.status === 'escalated' ? 'bg-red-500' :
              complaint.status === 'processing' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}>
              {complaint.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Category</h3>
              <p className="text-lg text-gray-900 mt-1">{complaint.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Priority</h3>
              <p className="text-lg text-gray-900 mt-1">{complaint.priority}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Created</h3>
              <p className="text-lg text-gray-900 mt-1">{new Date(complaint.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Last Updated</h3>
              <p className="text-lg text-gray-900 mt-1">{new Date(complaint.updated_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
          </div>

          {complaint.ai_analysis && (
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis</h2>
              <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm overflow-auto max-h-96">
                <pre>{JSON.stringify(complaint.ai_analysis, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

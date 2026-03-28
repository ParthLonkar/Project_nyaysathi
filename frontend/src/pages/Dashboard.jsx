import React, { useState, useEffect } from 'react';
import StatusCard from '../components/StatusCard';
import Loader from '../components/Loader';
import { complaintService } from '../services/complaint.service';

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (err) {
      setError('Failed to fetch complaints: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">My Complaints Dashboard</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.length > 0 ? (
            complaints.map(complaint => (
              <StatusCard key={complaint.id} complaint={complaint} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 mb-4">No complaints found.</p>
              <a href="/submit" className="text-blue-600 hover:underline">
                File a new complaint
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

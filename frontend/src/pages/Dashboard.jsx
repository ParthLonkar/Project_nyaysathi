import React, { useState, useEffect } from 'react';
import StatusCard from '../components/StatusCard';
import Loader from '../components/Loader';
import Layout from '../components/Layout';
import { complaintService } from '../services/complaint.service';
import { FileText, CheckCircle, Clock } from 'lucide-react';

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

  const stats = [
    { 
      icon: FileText, 
      label: 'Total Complaints', 
      value: complaints.length,
      color: 'blue'
    },
    { 
      icon: CheckCircle, 
      label: 'Resolved', 
      value: complaints.filter(c => c.status === 'resolved').length,
      color: 'green'
    },
    { 
      icon: Clock, 
      label: 'In Progress', 
      value: complaints.filter(c => c.status === 'processing').length,
      color: 'orange'
    }
  ];

  return (
    <Layout>
      <div className="page-section bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="container-lg">
          {/* Header */}
          <div className="mb-12">
            <h1 className="section-header mb-2">My Complaints Dashboard</h1>
            <p className="section-subheader mb-8">Track and manage all your filed complaints in one place</p>
          </div>

          {/* Stats Grid */}
          {complaints.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                const colorClasses = {
                  blue: 'from-blue-100 to-blue-200 text-blue-900',
                  green: 'from-green-100 to-green-200 text-green-900',
                  orange: 'from-orange-100 to-orange-200 text-orange-900',
                };
                
                return (
                  <div key={idx} className="card p-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-semibold mb-2 uppercase tracking-wide">{stat.label}</p>
                        <p className="text-5xl font-black text-blue-900">{stat.value}</p>
                      </div>
                      <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[stat.color]} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-8 h-8" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-8">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-red-900">Error Loading Complaints</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Complaints Grid */}
          {complaints.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Complaints ({complaints.length})</h2>
              <div className="grid-responsive">
                {complaints.map(complaint => (
                  <StatusCard key={complaint.id} complaint={complaint} />
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-16 text-center">
              <div className="text-6xl mb-6">📋</div>
              <p className="text-2xl font-bold text-gray-900 mb-4">No Complaints Yet</p>
              <p className="text-gray-600 text-lg mb-8">You haven't filed any complaints yet. Start your journey to justice today!</p>
              <a href="/submit" className="btn-primary inline-block">
                File Your First Complaint →
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

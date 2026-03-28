import React, { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';

const statusStyles = {
  compliant: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  'non-compliant': 'bg-red-100 text-red-800',
  non_compliant: 'bg-red-100 text-red-800'
};

export default function Compliance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await apiCall('/compliance');
        if (!response.ok) {
          throw new Error('Failed to fetch compliance records');
        }
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Unable to load compliance records.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compliance Monitoring</h1>
          <p className="text-gray-600 mt-2">Track policy compliance status across departments.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading compliance records...</div>
        ) : (
          <div className="space-y-4">
            {records.length === 0 && (
              <div className="text-gray-600">No compliance records available.</div>
            )}
            {records.map((record) => {
              const normalizedStatus = String(record.status || 'pending').toLowerCase();
              const statusLabel = normalizedStatus.replace('_', ' ');
              return (
              <div key={record.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{record.title}</h3>
                    <p className="text-gray-600 mt-2">{record.description}</p>
                    <p className="text-sm text-gray-500 mt-3">
                      Last checked: {record.last_checked ? new Date(record.last_checked).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusStyles[normalizedStatus] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabel || 'pending'}
                    </span>
                    <button className="text-indigo-600 font-semibold hover:text-indigo-800">View Details</button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}

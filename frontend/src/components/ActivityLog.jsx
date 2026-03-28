import React, { useState, useEffect } from 'react';
import { Activity, Calendar, User } from 'lucide-react';
import { API_BASE_URL } from '../utils/api.js';

export default function ActivityLog({ userType, limit = 20 }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivityLog();
  }, []);

  const fetchActivityLog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(`${userType}Token`);
      const response = await fetch(`${API_BASE_URL}/user/activity-log?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        const { logs: data } = await response.json();
        setLogs(data || []);
      } else {
        setError('Failed to load activity log');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      'login': '🔑 Login',
      'logout': '🚪 Logout',
      'profile_updated': '✏️ Profile Updated',
      'password_changed': '🔐 Password Changed',
      'complaint_created': '📝 Complaint Created',
      'complaint_updated': '♻️ Complaint Updated',
      'complaint_assigned': '👤 Complaint Assigned',
      'complaint_closed': '✅ Complaint Closed',
      'note_added': '💬 Note Added'
    };
    return labels[action] || action;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="text-gray-500">Loading activity log...</div></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Activity Log
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          {error}
        </div>
      )}

      {logs.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No activity yet</p>
      ) : (
        <div className="space-y-0 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div 
              key={log.id || index} 
              className="flex gap-4 py-4 border-b last:border-b-0 hover:bg-gray-50 px-2 rounded"
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-1">
                <div className="w-3 h-3 bg-indigo-600 rounded-full mt-1"></div>
                {index < logs.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>}
              </div>

              {/* Activity details */}
              <div className="flex-1 pt-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-gray-900">{getActionLabel(log.action)}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{formatDate(log.created_at)}</p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {Object.entries(log.details).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function StatusCard({ complaint }) {
  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
      'processing': 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500',
      'escalated': 'bg-red-100 text-red-800 border-l-4 border-red-500',
      'resolved': 'bg-green-100 text-green-800 border-l-4 border-green-500',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'new': 'bg-blue-500',
      'processing': 'bg-yellow-500',
      'escalated': 'bg-red-500',
      'resolved': 'bg-green-500',
    };
    return colors[status.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <div className={`card p-6 ${getStatusColor(complaint.status)}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{complaint.title}</h3>
        <span className={`${getStatusBadgeColor(complaint.status)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
          {complaint.status.toUpperCase()}
        </span>
      </div>
      <p className="text-sm font-medium mb-2">{complaint.category}</p>
      <p className="text-sm mb-4">{complaint.description.substring(0, 100)}...</p>
      <div className="flex justify-between text-xs text-gray-600">
        <small>ID: {complaint.id}</small>
        <small>Created: {new Date(complaint.created_at).toLocaleDateString()}</small>
      </div>
    </div>
  );
}

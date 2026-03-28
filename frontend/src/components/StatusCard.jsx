import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, AlertCircle, CheckCircle, Building2 } from 'lucide-react';

function getRoutingInfo(complaint) {
  const ai = complaint?.ai_analysis || {};
  const routing = ai.routing_info || ai.routing || {};
  return {
    department: routing.departmentName || ai.department || 'Pending routing',
    strategy: ai.legal_strategy || 'Routing strategy will be generated after AI processing.',
    priority: routing.priority || complaint?.priority || 'medium',
  };
}

export default function StatusCard({ complaint }) {
  const getStatusConfig = (status) => {
    const key = (status || 'new').toLowerCase();
    const configs = {
      'new': {
        badge: 'bg-blue-100 text-blue-900',
        border: 'border-l-4 border-blue-500',
        icon: FileText,
        label: 'New'
      },
      'routed': {
        badge: 'bg-indigo-100 text-indigo-900',
        border: 'border-l-4 border-indigo-500',
        icon: Building2,
        label: 'Routed'
      },
      'processing': {
        badge: 'bg-orange-100 text-orange-900',
        border: 'border-l-4 border-orange-500',
        icon: Clock,
        label: 'In Progress'
      },
      'escalated': {
        badge: 'bg-red-100 text-red-900',
        border: 'border-l-4 border-red-500',
        icon: AlertCircle,
        label: 'Escalated'
      },
      'resolved': {
        badge: 'bg-green-100 text-green-900',
        border: 'border-l-4 border-green-500',
        icon: CheckCircle,
        label: 'Resolved'
      },
    };
    return configs[key] || configs['new'];
  };

  const config = getStatusConfig(complaint.status);
  const Icon = config.icon;
  const routingInfo = getRoutingInfo(complaint);

  return (
    <div className={`card p-6 hover:shadow-xl transition-all duration-300 ${config.border} overflow-hidden group`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {complaint.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 uppercase tracking-wide font-semibold">
            {complaint.category || 'General'}
          </p>
        </div>
        <div className={`badge ${config.badge} flex items-center gap-1 whitespace-nowrap ml-2`}>
          <Icon className="w-4 h-4" strokeWidth={2} />
          {config.label}
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
        {complaint.description}
      </p>

      <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 mb-4">
        <p className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-1">Routed Department</p>
        <p className="text-sm font-bold text-blue-900">{routingInfo.department}</p>
        <p className="text-xs text-blue-800 mt-1 line-clamp-2">{routingInfo.strategy}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-t border-gray-200 pt-4">
        <div>
          <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-1">Complaint ID</p>
          <p className="font-mono text-sm font-bold text-gray-900">{complaint.id?.slice(0, 8)}...</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-1">Priority</p>
          <p className="text-sm font-bold text-gray-900 uppercase">{routingInfo.priority}</p>
        </div>
      </div>

      <Link to={`/complaint/${complaint.id}`} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2">
        <span>??</span> View Details ?
      </Link>
    </div>
  );
}

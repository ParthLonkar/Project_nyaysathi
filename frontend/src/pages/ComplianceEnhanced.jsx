import React, { useState, useEffect } from 'react';

const sampleCompliance = {
  overall: 85,
  trend: 'up',
  checklists: [
    { id: 1, title: 'Timely Complaint Registration', completed: 12, total: 15, status: 'In Progress' },
    { id: 2, title: 'RTI Application Processing (30 days)', completed: 8, total: 10, status: 'Compliant' },
    { id: 3, title: 'Evidence Documentation', completed: 25, total: 25, status: 'Compliant' },
    { id: 4, title: 'Complainant Communications', completed: 18, total: 20, status: 'In Progress' },
    { id: 5, title: 'Department Coordination', completed: 5, total: 10, status: 'At Risk' },
  ],
  departments: [
    { dept: 'Police Department', score: 92, status: 'Excellent', lastAudit: '2026-03-29' },
    { dept: 'Municipal Services', score: 78, status: 'Good', lastAudit: '2026-03-28' },
    { dept: 'Revenue Department', score: 85, status: 'Good', lastAudit: '2026-03-27' },
    { dept: 'Health Department', score: 88, status: 'Good', lastAudit: '2026-03-26' },
    { dept: 'Education Department', score: 95, status: 'Excellent', lastAudit: '2026-03-25' },
    { dept: 'Public Works', score: 72, status: 'Fair', lastAudit: '2026-03-24' },
  ],
  alerts: [
    { id: 1, type: 'warning', title: 'Public Works Non-Compliance', message: 'Compliance score dropped to 72%', date: '2026-03-29 09:15 AM', department: 'Public Works' },
    { id: 2, type: 'info', title: 'Compliance Check Scheduled', message: 'Next audit scheduled for 2026-04-05', date: '2026-03-28 04:30 PM', department: 'All' },
    { id: 3, type: 'error', title: 'Critical: RTI Response Overdue', message: '3 RTI applications pending response', date: '2026-03-27 02:00 PM', department: 'Revenue' },
  ],
  auditLogs: [
    { id: 1, action: 'Compliance Check Run', date: '2026-03-29 10:30 AM', status: 'Completed', user: 'Admin', details: 'Full compliance audit across 6 departments' },
    { id: 2, action: 'Policy Updated', date: '2026-03-28 02:15 PM', status: 'Completed', user: 'Policy Team', details: 'Updated RTI processing guidelines' },
    { id: 3, action: 'Non-compliance Alert', date: '2026-03-27 08:45 AM', status: 'Reviewed', user: 'Compliance Officer', details: 'Public Works department alert reviewed' },
    { id: 4, action: 'Audit Initiated', date: '2026-03-26 09:00 AM', status: 'Completed', user: 'Compliance Officer', details: 'Manual audit for Municipal Services' },
  ],
};

export default function ComplianceEnhanced() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDept, setSelectedDept] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  }, [activeTab]);

  const dismissAlert = (id) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Excellent': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Good': 'bg-blue-100 text-blue-800 border-blue-200',
      'Fair': 'bg-amber-100 text-amber-800 border-amber-200',
      'At Risk': 'bg-red-100 text-red-800 border-red-200',
      'Compliant': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getAlertColor = (type) => {
    const colors = {
      error: 'bg-red-100 border-red-300 text-red-900',
      warning: 'bg-amber-100 border-amber-300 text-amber-900',
      info: 'bg-blue-100 border-blue-300 text-blue-900',
      success: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="bg-slate-50 text-on-surface min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-primary">Compliance Management</h1>
              <p className="text-sm text-slate-600 mt-1">Monitor policy compliance and audit performance</p>
            </div>
            <button className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">play_circle</span>
              Run Audit Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Overall Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Overall Compliance</p>
            <div className="mt-4 flex items-end gap-4">
              <div className="text-5xl font-extrabold text-primary">{sampleCompliance.overall}%</div>
              <span className="material-symbols-outlined text-emerald-500 mb-2 text-2xl">trending_up</span>
            </div>
            <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${sampleCompliance.overall}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Active Checklists</p>
            <p className="text-4xl font-extrabold text-secondary mt-4">{sampleCompliance.checklists.length}</p>
            <p className="text-sm text-slate-600 mt-2">Across 6 departments</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Critical Alerts</p>
            <p className="text-4xl font-extrabold text-error mt-4">{sampleCompliance.alerts.filter(a => a.type === 'error').length}</p>
            <p className="text-sm text-slate-600 mt-2">Requiring attention</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Last Audit</p>
            <p className="text-lg font-bold text-slate-900 mt-4">2026-03-29</p>
            <p className="text-sm text-slate-600 mt-2">10:30 AM</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
          {['dashboard', 'checklists', 'departments', 'alerts', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'dashboard' && '📊 Dashboard'}
              {tab === 'checklists' && '✅ Checklists'}
              {tab === 'departments' && '🏢 Departments'}
              {tab === 'alerts' && `⚠️ Alerts (${sampleCompliance.alerts.filter(a => !dismissedAlerts.includes(a.id)).length})`}
              {tab === 'audit' && '📋 Audit Logs'}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-on-surface mb-6">Department Performance</h3>
                <div className="space-y-4">
                  {sampleCompliance.departments.map((dept) => (
                    <div
                      key={dept.dept}
                      onClick={() => setSelectedDept(dept)}
                      className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-on-surface">{dept.dept}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dept.status)}`}>
                          {dept.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full" style={{
                            width: `${dept.score}%`,
                            backgroundColor: dept.score >= 90 ? '#10b981' : dept.score >= 80 ? '#3b82f6' : dept.score >= 70 ? '#f59e0b' : '#ef4444'
                          }}></div>
                        </div>
                        <span className="text-sm font-bold text-primary">{dept.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-on-surface mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-600 font-bold">Compliant</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">85%</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-bold">In Progress</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">12%</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 font-bold">At Risk</p>
                  <p className="text-2xl font-bold text-red-700 mt-1">3%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checklists Tab */}
        {activeTab === 'checklists' && (
          <div className="space-y-4">
            {sampleCompliance.checklists.map((checklist) => (
              <div key={checklist.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">{checklist.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{checklist.completed} of {checklist.total} items completed</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(checklist.status)}`}>
                    {checklist.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(checklist.completed / checklist.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-primary">{Math.round((checklist.completed / checklist.total) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleCompliance.departments.map((dept) => (
              <div key={dept.dept} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{dept.dept}</h3>
                    <p className="text-xs text-slate-600 mt-1">Last audit: {dept.lastAudit}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(dept.status)}`}>
                    {dept.status}
                  </span>
                </div>
                <div className="mb-4 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${dept.score}%`,
                      backgroundColor: dept.score >= 90 ? '#10b981' : dept.score >= 80 ? '#3b82f6' : dept.score >= 70 ? '#f59e0b' : '#ef4444'
                    }}
                  ></div>
                </div>
                <div className="text-3xl font-bold text-primary">{dept.score}%</div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {sampleCompliance.alerts.filter(a => !dismissedAlerts.includes(a.id)).map((alert) => (
              <div key={alert.id} className={`rounded-xl border-l-4 p-4 flex items-start justify-between ${getAlertColor(alert.type)}`}>
                <div className="flex items-start gap-3 flex-1">
                  <span className="material-symbols-outlined text-xl mt-0.5">
                    {alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : alert.type === 'success' ? 'check_circle' : 'info'}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span>{alert.date}</span>
                      <span className="font-semibold">{alert.department}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-current hover:opacity-70 transition-opacity ml-4"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ))}
            {sampleCompliance.alerts.filter(a => !dismissedAlerts.includes(a.id)).length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">check_circle_outline</span>
                <p className="text-slate-600">All alerts dismissed. System compliant.</p>
              </div>
            )}
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            {sampleCompliance.auditLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-on-surface">{log.action}</h4>
                    <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    log.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : log.status === 'Reviewed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {log.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {log.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span>
                    {log.user}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

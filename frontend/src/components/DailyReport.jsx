import React, { useState } from 'react';
import { Download, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/api.js';

export default function DailyReport({ adminToken }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [fallbackMode, setFallbackMode] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      setFallbackMode(false);

      const response = await fetch(
        `${API_BASE_URL}/admin/daily-report?date=${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      const data = await response.json();

      if (data.success) {
        setReportData(data.report);
      } else {
        setError(data.error || 'Failed to fetch report');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/admin/daily-report/download/pdf?date=${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      // Check if it's a PDF or JSON (fallback)
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/pdf')) {
        // It's a PDF file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Daily_Report_${selectedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // It's JSON (fallback mode)
        const data = await response.json();
        if (data.fallback) {
          setFallbackMode(true);
          setReportData(data.report);
          setError('PDF service unavailable. Report data is displayed but not saved as PDF.');
        } else {
          throw new Error('Unexpected response format');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Complaint Report</h2>

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline mr-2 h-4 w-4" />
            Report Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition"
        >
          <RefreshCw className="h-4 w-4" />
          {loading ? 'Loading...' : 'Generate Report'}
        </button>

        {reportData && (
          <button
            onClick={downloadPDF}
            disabled={downloading || !reportData}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2 transition"
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Download...' : 'Download PDF'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
            {fallbackMode && (
              <p className="text-xs text-red-700 mt-1">Report data is displayed but PDF generation is unavailable.</p>
            )}
          </div>
        </div>
      )}

      {/* Report Content */}
      {reportData && (
        <div className="space-y-6">
          {/* Header Information */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Report Date</p>
                <p className="font-semibold text-gray-900">{reportData.reportDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Complaints</p>
                <p className="font-semibold text-gray-900">{reportData.totalComplaintsReceived}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Resolution Time</p>
                <p className="font-semibold text-gray-900">{reportData.kpis.averageResolutionTime} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">SLA Compliance</p>
                <p className="font-semibold text-gray-900">{reportData.kpis.slaComplianceRate}%</p>
              </div>
            </div>
          </div>

          {/* Complaints by Status */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints by Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(reportData.statusBreakdown).map(([status, count]) => (
                <div key={status} className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 uppercase">{status.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Complaints by Severity */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints by Severity</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(reportData.severityBreakdown).map(([severity, count]) => {
                const severityColors = {
                  high: 'bg-red-100 text-red-800',
                  medium: 'bg-yellow-100 text-yellow-800',
                  low: 'bg-green-100 text-green-800',
                };
                return (
                  <div key={severity} className={`p-4 rounded ${severityColors[severity] || 'bg-gray-100'}`}>
                    <p className="font-medium capitalize">{severity} Priority</p>
                    <p className="text-3xl font-bold">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KPIs */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Average Resolution Time</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.kpis.averageResolutionTime}</p>
                <p className="text-xs text-gray-500">days</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Total Resolved</p>
                <p className="text-2xl font-bold text-green-600">{reportData.kpis.totalResolved}</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-600">SLA Compliance Rate</p>
                <p className="text-2xl font-bold text-purple-600">{reportData.kpis.slaComplianceRate}%</p>
              </div>
            </div>
          </div>

          {/* Escalated Issues */}
          {reportData.escalatedComplaints && reportData.escalatedComplaints.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                High-Priority / Escalated Issues ({reportData.escalatedComplaints.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-200">
                      <th className="text-left py-2 px-3 text-red-900 font-semibold">ID</th>
                      <th className="text-left py-2 px-3 text-red-900 font-semibold">Title</th>
                      <th className="text-left py-2 px-3 text-red-900 font-semibold">Priority</th>
                      <th className="text-left py-2 px-3 text-red-900 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.escalatedComplaints.slice(0, 5).map((complaint, idx) => (
                      <tr key={idx} className="border-b border-red-100 hover:bg-red-100">
                        <td className="py-2 px-3">{complaint.id.substring(0, 8)}</td>
                        <td className="py-2 px-3">{complaint.title}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-semibold">
                            {complaint.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-3">{complaint.status.replace('_', ' ').toUpperCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reportData.escalatedComplaints.length > 5 && (
                <p className="mt-2 text-sm text-red-700">
                  ...and {reportData.escalatedComplaints.length - 5} more escalated issues
                </p>
              )}
            </div>
          )}

          {/* Detailed Complaint Log */}
          {reportData.detailedComplaints && reportData.detailedComplaints.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Complaint Log ({reportData.detailedComplaints.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-300">
                      <th className="text-left py-2 px-3 text-gray-800 font-semibold">ID</th>
                      <th className="text-left py-2 px-3 text-gray-800 font-semibold">Title</th>
                      <th className="text-left py-2 px-3 text-gray-800 font-semibold">Category</th>
                      <th className="text-left py-2 px-3 text-gray-800 font-semibold">Status</th>
                      <th className="text-left py-2 px-3 text-gray-800 font-semibold">Priority</th>
                      <th className="text-left py-2 px-3 text-gray-800 font-semibold">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.detailedComplaints.slice(0, 10).map((complaint, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="py-2 px-3 font-mono text-xs">{complaint.id.substring(0, 8)}</td>
                        <td className="py-2 px-3 truncate">{complaint.title}</td>
                        <td className="py-2 px-3">{complaint.category}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {complaint.status}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            complaint.priority === 'high' ? 'bg-red-100 text-red-800' :
                            complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {complaint.priority}
                          </span>
                        </td>
                        <td className="py-2 px-3">{complaint.staffAssignment?.staff_name || complaint.assignedTo || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reportData.detailedComplaints.length > 10 && (
                <p className="mt-2 text-sm text-gray-600">
                  Showing 10 of {reportData.detailedComplaints.length} complaints. Download PDF to see all complaints.
                </p>
              )}
            </div>
          )}

          {/* No Data Message */}
          {reportData.totalComplaintsReceived === 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800">No complaints received on this date.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Select a date and click "Generate Report" to view the daily report</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 mt-4">Generating report...</p>
        </div>
      )}
    </div>
  );
}

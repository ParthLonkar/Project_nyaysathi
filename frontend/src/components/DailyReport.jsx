import React, { useState, useEffect } from 'react';
import { Download, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/api.js';

export default function DailyReport({ adminToken }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('3day');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [fallbackMode, setFallbackMode] = useState(false);
  const [diagnostics, setDiagnostics] = useState({
    tokenFromProp: false,
    tokenFromStorage: false,
    finalToken: null,
    apiUrl: '',
    timestamp: new Date().toISOString()
  });

  // Get token - prefer prop, fallback to localStorage
  const token = adminToken || localStorage.getItem('adminToken');

  // Debug logging on mount
  useEffect(() => {
    const diag = {
      tokenFromProp: !!adminToken,
      tokenFromStorage: !!localStorage.getItem('adminToken'),
      finalToken: token ? `${token.substring(0, 30)}...` : 'NULL',
      apiUrl: API_BASE_URL,
      timestamp: new Date().toISOString()
    };
    setDiagnostics(diag);

    console.log('=== DailyReport Component Mounted ===');
    console.log('🔍 Diagnostics:', diag);
    console.log('adminToken prop:', !!adminToken ? 'Yes' : 'No');
    console.log('localStorage adminToken:', localStorage.getItem('adminToken') ? 'Yes' : 'No');
    console.log('Final token available:', !!token ? 'Yes' : 'No');
    console.log('API URL:', API_BASE_URL);
    
    // Expose to window for manual testing
    window.dailyReportDebug = {
      token: token,
      diagnostics: diag,
      tokenLength: token ? token.length : 0,
      hasAdminToken: !!localStorage.getItem('adminToken'),
      adminTokenValue: localStorage.getItem('adminToken') ? `${localStorage.getItem('adminToken').substring(0, 30)}...` : 'NONE'
    };
    
    console.log('Debug info available at: window.dailyReportDebug');
  }, [adminToken, token]);

  const fetchReport = async () => {
    console.log('\n🔵 FETCH BUTTON CLICKED');
    console.log('Token available:', !!token);

    if (!token) {
      const msg = '❌ No authentication token. Please log in as admin.';
      console.error(msg);
      setError(msg);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setFallbackMode(false);

      const params = new URLSearchParams();
      params.append('date', selectedDate);
      if (reportType === 'daily') {
        params.append('reportType', 'daily');
      }

      const url = `${API_BASE_URL}/admin/daily-report?${params.toString()}`;
      console.log('📤 API URL:', url);
      console.log('📤 Auth Header: Bearer', token.substring(0, 20) + '...');

      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      console.log('📥 Response Status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          console.log('Could not parse error response');
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('📊 Response Data:', data);

      if (data.success && data.report) {
        setReportData(data.report);
        console.log('✅ Report loaded successfully');
      } else {
        const msg = data.error || 'No report data';
        setError(msg);
        console.error('❌ Error:', msg);
      }
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      console.error('❌ Exception:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      setDownloading(true);
      setError('');

      const params = new URLSearchParams();
      params.append('date', selectedDate);
      if (reportType === 'daily') {
        params.append('reportType', 'daily');
      }

      const url = `${API_BASE_URL}/admin/daily-report/download/pdf?${params.toString()}`;
      console.log('Downloading PDF from:', url);

      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to download PDF`);
      }

      // Check if it's a PDF or JSON (fallback)
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/pdf')) {
        // It's a PDF file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType === '3day' ? 'ThreeDay' : 'Daily'}_Report_${selectedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('PDF downloaded successfully');
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
      console.error('Download error:', err);
      setError(err.message || 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {reportType === '3day' ? 'Last 3 Days Complaint Report' : 'Daily Complaint Report'}
      </h2>
      
      {/* Diagnostic Panel */}
      <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 text-xs font-mono">
        <div className="font-bold mb-2 text-gray-700">🔧 Diagnostic Info (for debugging)</div>
        <div className="space-y-1 text-gray-600">
          <div>Token from Prop: {diagnostics.tokenFromProp ? '✓ YES' : '✗ NO'}</div>
          <div>Token from localStorage: {diagnostics.tokenFromStorage ? '✓ YES' : '✗ NO'}</div>
          <div>Final Token: {token ? `✓ ${token.substring(0, 30)}...` : '✗ NULL'}</div>
          <div>API URL: {diagnostics.apiUrl}</div>
          <div>Timestamp: {diagnostics.timestamp}</div>
          <div className="mt-2 text-blue-600">💡 Tip: Open browser console and type: window.dailyReportDebug</div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="text-xs mb-4 p-2 bg-gray-100 rounded">
        {token ? (
          <span className="text-green-700">✓ Authenticated</span>
        ) : (
          <span className="text-red-700">✗ Not authenticated</span>
        )}
        {' | API: ' + API_BASE_URL}
      </div>

      {/* Auth Warning */}
      {!token && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">⚠️ Not authenticated</p>
            <p className="text-xs text-yellow-700 mt-1">Please log in as admin to generate reports. If you just logged in, the page might need a refresh.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline mr-2 h-4 w-4" />
            Report End Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading || !token}
          />
          <p className="text-xs text-gray-500 mt-1">
            {reportType === '3day' ? '(Report will include last 3 days from this date)' : '(Report for this day only)'}
          </p>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            disabled={loading || !token}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3day">Last 3 Days (Default)</option>
            <option value="daily">Single Day Only</option>
          </select>
        </div>

        <button
          onClick={fetchReport}
          disabled={loading || !token}
          type="button"
          className={`px-6 py-2 text-white rounded-lg flex items-center gap-2 transition whitespace-nowrap font-medium ${
            loading || !token
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          {loading ? 'Loading...' : 'Generate Report'}
        </button>

        {reportData && (
          <button
            onClick={downloadPDF}
            disabled={downloading || !reportData || !token}
            title={!token ? 'Please log in as admin' : 'Download PDF'}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition whitespace-nowrap"
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
                <p className="text-sm text-gray-600">Report Period</p>
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

          {/* Daily Breakdown for 3-Day Reports */}
          {reportData.isThreeDayReport && reportData.dailyBreakdown && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Daily Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(reportData.dailyBreakdown).sort().map(([date, count]) => (
                  <div key={date} className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm font-medium text-blue-700">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-2xl font-bold text-blue-600">{count}</p>
                    <p className="text-xs text-gray-500">complaints received</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {reportData.isThreeDayReport && (
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-600">Avg Per Day</p>
                  <p className="text-2xl font-bold text-orange-600">{reportData.kpis.complaintVolumePerDay}</p>
                  <p className="text-xs text-gray-500">complaints/day</p>
                </div>
              )}
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

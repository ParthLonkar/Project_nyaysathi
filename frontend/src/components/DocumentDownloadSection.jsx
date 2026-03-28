import React, { useState, useEffect } from 'react';
import { Download, FileText, Eye } from 'lucide-react';

export default function DocumentDownloadSection({ complaintId, rtiPdf, complaintPdf, isLoading }) {
  const [downloading, setDownloading] = useState({});

  const handleDownloadPDF = (pdfdoc, filename) => {
    if (!pdfdoc) {
      alert('PDF not available');
      return;
    }

    setDownloading(prev => ({ ...prev, [filename]: true }));
    
    try {
      // Convert base64 or bytes to blob
      const binary = atob(pdfdoc);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      const blob = new Blob([new Uint8Array(array)], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF');
    } finally {
      setDownloading(prev => ({ ...prev, [filename]: false }));
    }
  };

  const handleViewPDF = (pdfData, filename) => {
    if (!pdfData) {
      alert('PDF not available');
      return;
    }

    try {
      const binary = atob(pdfData);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      const blob = new Blob([new Uint8Array(array)], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('View error:', error);
      alert('Failed to view PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700">Generating documents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* RTI Application */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">RTI Application Form</h3>
              <p className="text-sm text-slate-600">Right to Information Act - 2005</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-700 mb-4">
          This RTI form requests information about your complaint from the concerned public authority. You can download, print, and submit it to accelerate the resolution process.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleViewPDF(rtiPdf, `RTI_Application_${complaintId}.pdf`)}
            disabled={!rtiPdf || downloading['rti-view']}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            {downloading['rti-view'] ? 'Opening...' : 'View'}
          </button>

          <button
            onClick={() => handleDownloadPDF(rtiPdf, `RTI_Application_${complaintId}.pdf`)}
            disabled={!rtiPdf || downloading['rti-download']}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading['rti-download'] ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          <strong>📌 Tip:</strong> Download this form, fill in the highlighted fields, and submit it to the Public Information Officer of the concerned department.
        </div>
      </div>

      {/* Complaint Draft */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Formal Complaint Draft</h3>
              <p className="text-sm text-slate-600">Professional complaint letter</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-700 mb-4">
          Your complaint has been formatted as a formal letter suitable for submission to the concerned department. This draft can be printed, signed, and sent via mail or delivered in person.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleViewPDF(complaintPdf, `Complaint_Draft_${complaintId}.pdf`)}
            disabled={!complaintPdf || downloading['complaint-view']}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            {downloading['complaint-view'] ? 'Opening...' : 'View'}
          </button>

          <button
            onClick={() => handleDownloadPDF(complaintPdf, `Complaint_Draft_${complaintId}.pdf`)}
            disabled={!complaintPdf || downloading['complaint-download']}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading['complaint-download'] ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          <strong>📌 Tip:</strong> You can edit this draft before printing. Keep a copy for your records and submit to the department for faster processing.
        </div>
      </div>

      {/* Admin Copy Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
        <strong>📋 Admin Copy:</strong> A copy of all generated documents has been transferred to the admin workspace for record-keeping and processing.
      </div>
    </div>
  );
}

import React from 'react';

const getDocUrl = (doc) => doc?.download_url || doc?.signed_url || doc?.public_url || doc?.view_url || null;

export default function GeneratedDocumentsPanel({
  documents = [],
  complaintDraftText = '',
  rtiDraftText = '',
  title = 'Generated Documents',
  compact = false,
}) {
  const complaintPdf = (documents || []).find((doc) => doc.document_type === 'complaint_pdf');
  const rtiPdf = (documents || []).find((doc) => doc.document_type === 'rti_pdf');

  const complaintPdfUrl = getDocUrl(complaintPdf);
  const rtiPdfUrl = getDocUrl(rtiPdf);

  return (
    <div className={compact ? 'space-y-3' : 'card p-8'}>
      {!compact && <h3 className="text-xl font-black text-gray-900 mb-6">{title}</h3>}
      <div className="space-y-4 text-sm">
        {complaintDraftText && (
          <details className="w-full rounded border border-gray-200 bg-gray-50 p-3">
            <summary className="cursor-pointer font-semibold text-blue-800">View Complaint Letter</summary>
            <pre className="whitespace-pre-wrap text-xs text-gray-700 mt-3">{complaintDraftText}</pre>
          </details>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-gray-700">Complaint PDF:</span>
          {complaintPdfUrl ? (
            <>
              <a href={complaintPdfUrl} target="_blank" rel="noreferrer" className="btn-secondary py-2 px-4">
                View Complaint PDF
              </a>
              <a href={complaintPdfUrl} download className="btn-primary py-2 px-4">
                Download Complaint PDF
              </a>
            </>
          ) : (
            <span className="text-gray-500">Not available</span>
          )}
        </div>

        {rtiDraftText && (
          <details className="w-full rounded border border-gray-200 bg-gray-50 p-3">
            <summary className="cursor-pointer font-semibold text-blue-800">View RTI Draft</summary>
            <pre className="whitespace-pre-wrap text-xs text-gray-700 mt-3">{rtiDraftText}</pre>
          </details>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-gray-700">RTI PDF:</span>
          {rtiPdfUrl ? (
            <>
              <a href={rtiPdfUrl} target="_blank" rel="noreferrer" className="btn-secondary py-2 px-4">
                View RTI PDF
              </a>
              <a href={rtiPdfUrl} download className="btn-primary py-2 px-4">
                Download RTI PDF
              </a>
            </>
          ) : (
            <span className="text-gray-500">Not available</span>
          )}
        </div>

        {!complaintDraftText && !rtiDraftText && !complaintPdfUrl && !rtiPdfUrl && (
          <p className="text-gray-500">Generated documents are not available yet for this complaint.</p>
        )}
      </div>
    </div>
  );
}

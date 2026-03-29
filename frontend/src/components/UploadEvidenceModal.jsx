import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../utils/api.js';

export default function UploadEvidenceModal({ complaintId, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('evidence');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('File size must be less than 15MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.size > 15 * 1024 * 1024) {
        setError('File size must be less than 15MB');
        setFile(null);
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('staffToken');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);

      const response = await fetch(
        `${API_BASE_URL}/staff/complaints/${complaintId}/upload-evidence`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      setSuccess(`File "${file.name}" uploaded successfully!`);
      setFile(null);
      setFileType('evidence');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Upload Evidence</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-emerald-800 p-1 rounded transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* File Type Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Document Type
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-100"
            >
              <option value="evidence">Evidence/Support Document</option>
              <option value="inspection_report">Inspection Report</option>
              <option value="field_visit_notes">Field Visit Notes</option>
              <option value="other">Other Document</option>
            </select>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center hover:bg-emerald-50/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-2">
              <span className="material-symbols-outlined text-4xl text-emerald-600 mx-auto block">
                cloud_upload
              </span>
              <p className="text-sm font-semibold text-slate-700">
                Drop file here or click to browse
              </p>
              <p className="text-xs text-slate-500">
                PDF, DOC, DOCX, images (max 15MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              disabled={loading}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
          </div>

          {/* Selected File Display */}
          {file && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-lg">
                  description
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={loading}
                className="text-emerald-600 hover:text-emerald-700 p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600 flex-shrink-0">error</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
              <span className="material-symbols-outlined text-green-600 flex-shrink-0">
                check_circle
              </span>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined">
                  hourglass_empty
                </span>
                Uploading...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">upload</span>
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

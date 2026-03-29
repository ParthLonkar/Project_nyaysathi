import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api.js';

export default function StaffCaseDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    status: '',
    progress: 0,
    note: '',
    file: null
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    console.log('StaffCaseDetails ID from params:', id, 'Length:', id?.length);
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('staffToken');

      const response = await fetch(`${API_BASE_URL}/staff/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        const { complaint: data } = await response.json();
        setComplaint(data);
        // Initialize form with current complaint data
        setFormData(prev => ({
          ...prev,
          status: data.status || 'in_progress',
          progress: data.progress_percentage || 0
        }));
      } else {
        setError('Failed to load complaint details');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('staffToken');
      const response = await fetch(`${API_BASE_URL}/staff/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setFormData(prev => ({ ...prev, status: newStatus }));
        setSuccessMessage('Status updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchComplaintDetails();
      } else {
        setError('Failed to update status');
      }
    } catch (err) {
      setError('Error updating status: ' + err.message);
    }
  };

  const handleProgressChange = async (newProgress) => {
    try {
      const token = localStorage.getItem('staffToken');
      const response = await fetch(`${API_BASE_URL}/staff/complaints/${id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ progressPercentage: newProgress })
      });

      if (response.ok) {
        setFormData(prev => ({ ...prev, progress: newProgress }));
        setSuccessMessage('Progress updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchComplaintDetails();
      } else {
        setError('Failed to update progress');
      }
    } catch (err) {
      setError('Error updating progress: ' + err.message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!formData.note.trim()) {
      setError('Please enter a note');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('staffToken');
      const response = await fetch(`${API_BASE_URL}/staff/complaints/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ noteText: formData.note })
      });

      if (response.ok) {
        setSuccessMessage('Note added successfully');
        setFormData(prev => ({ ...prev, note: '' }));
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchComplaintDetails();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add note');
      }
    } catch (err) {
      setError('Error adding note: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('staffToken');
      const fileFormData = new FormData();
      fileFormData.append('file', formData.file);
      fileFormData.append('fileType', 'evidence');

      const response = await fetch(`${API_BASE_URL}/staff/complaints/${id}/upload-evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: fileFormData
      });

      if (response.ok) {
        setSuccessMessage('Evidence file uploaded successfully');
        setFormData(prev => ({ ...prev, file: null }));
        // Reset file input
        const fileInput = document.getElementById('evidence-file');
        if (fileInput) fileInput.value = '';
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchComplaintDetails();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload file');
      }
    } catch (err) {
      setError('Error uploading file: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-slate-500">Loading complaint details...</div>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-red-500">{error || 'Complaint not found'}</div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-slate-50 border-r border-slate-200/15 z-50">
        <div className="p-6">
          <h1 className="font-headline font-extrabold text-primary text-2xl tracking-tight">NyaySathi</h1>
          <p className="text-xs text-secondary font-medium mt-1">Legal Workspace</p>
        </div>
        <nav className="flex flex-col p-4 gap-y-2 flex-grow">
          <button
            type="button"
            onClick={() => navigate('/staff/dashboard')}
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50/50 hover:text-primary transition-all duration-300 rounded-lg group text-left"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/task')}
            className="flex items-center gap-3 px-4 py-3 bg-white text-primary font-bold rounded-lg shadow-sm transition-all duration-300 text-left"
          >
            <span className="material-symbols-outlined">assignment_turned_in</span>
            <span className="text-sm">My Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/profile')}
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50/50 hover:text-primary transition-all duration-300 rounded-lg group text-left"
          >
            <span className="material-symbols-outlined">description</span>
            <span className="text-sm font-medium">Documents</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/profile')}
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-emerald-50/50 hover:text-primary transition-all duration-300 rounded-lg group text-left"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="mt-4 mx-2 bg-gradient-to-br from-primary to-primary-container text-white py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-[0.98] transition-transform">
            <span className="material-symbols-outlined text-sm">add</span>
            New Complaint
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100 mt-auto">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors w-full text-left">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-sm font-medium">Support</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/login')}
            className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="h-16 sticky top-0 bg-white/80 backdrop-blur-md z-40 flex justify-between items-center px-8 border-b border-slate-200/15">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
            <h2 className="font-headline font-bold text-xl text-primary uppercase tracking-tight">Case Details</h2>
            <span className="text-sm bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-mono font-bold ml-2">
              {complaint?.reference_id || `#${id?.slice(0, 8)}`}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
              <input className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" placeholder="Search workspace..." type="text" />
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-primary relative transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 h-2 w-2 bg-error rounded-full border-2 border-white"></span>
              </button>
              <button className="text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
              <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-primary-fixed ring-2 ring-primary-fixed/30">
                <div className="w-full h-full bg-primary-fixed/40 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1440px] mx-auto grid grid-cols-12 gap-10">
          {/* Alerts */}
          {error && (
            <div className="col-span-12 p-4 bg-error-container/20 text-error rounded-lg border border-error/20 flex items-start gap-3">
              <span className="material-symbols-outlined flex-shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="col-span-12 p-4 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-300 flex items-start gap-3">
              <span className="material-symbols-outlined flex-shrink-0 mt-0.5">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-2xl text-primary">{complaint?.title || 'Complaint Description'}</h3>
                  <p className="text-sm text-slate-500 mt-2">Reference ID: {complaint?.reference_id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  complaint?.priority === 'high' ? 'bg-error text-white' :
                  complaint?.priority === 'medium' ? 'bg-amber-400 text-amber-900' :
                  'bg-emerald-100 text-emerald-900'
                }`}>
                  {complaint?.priority || 'Medium'} Priority
                </span>
              </div>
              <p className="text-on-surface/80 leading-relaxed text-lg mb-6">
                {complaint?.description || 'No description available'}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{complaint?.category || 'General'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-medium text-slate-900 mt-1 capitalize">{complaint?.status?.replace(/_/g, ' ') || 'New'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Submitted</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{formatDate(complaint?.submitted_at)}</p>
                </div>
              </div>
            </section>

            {/* Work Progress Update Section */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border-l-4 border-primary">
              <h3 className="font-headline font-bold text-2xl text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">edit_note</span>
                Work Progress Update
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Complaint Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                {/* Progress Percentage */}
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Progress: {formData.progress}%</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => handleProgressChange(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-16 px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${formData.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Work Notes */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-600 mb-2">Add Work Note</label>
                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Describe work completed, findings, or next steps..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-on-surface placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    rows="4"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={submitting || !formData.note.trim()}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {submitting ? 'Adding...' : 'Add Note'}
                  </button>
                </form>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Upload Evidence/Document</label>
                <form onSubmit={handleFileUpload} className="space-y-3">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      id="evidence-file"
                      type="file"
                      onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label htmlFor="evidence-file" className="cursor-pointer">
                      <span className="material-symbols-outlined text-4xl text-slate-400 block mb-2">cloud_upload</span>
                      <span className="text-sm font-medium text-slate-600">
                        {formData.file ? formData.file.name : 'Click to upload or drag and drop'}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, or images up to 15MB</p>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !formData.file}
                    className="w-full px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {submitting ? 'Uploading...' : 'Upload Evidence'}
                  </button>
                </form>
              </div>
            </section>

            {/* Work History / Notes Timeline */}
            {complaint?.complaint_notes && complaint.complaint_notes.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8 ml-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  <h3 className="font-headline font-bold text-xl text-primary">Work Progress Notes</h3>
                </div>
                <div className="relative space-y-6 pl-8">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
                  {complaint.complaint_notes.map((note, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[23px] h-4 w-4 rounded-full bg-primary ring-4 ring-white"></div>
                      <div className="flex justify-between items-start bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-on-surface">{note.note_text}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            By: {note.created_by_name || 'Staff Member'}
                          </p>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4 whitespace-nowrap">
                          {formatDate(note.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Relevant Documents */}
            <section>
              <div className="flex items-center gap-3 mb-6 ml-2">
                <span className="material-symbols-outlined text-primary">folder_open</span>
                <h3 className="font-headline font-bold text-xl text-primary">Relevant Documents & Evidence</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaint?.documents && complaint.documents.length > 0 ? (
                  complaint.documents.map((doc, idx) => {
                    const getFileIcon = (docType) => {
                      if (docType.includes('pdf')) return 'picture_as_pdf';
                      if (docType.includes('image') || docType.includes('jpg') || docType.includes('png')) return 'image';
                      if (docType.includes('docx') || docType.includes('doc')) return 'description';
                      return 'attachment';
                    };

                    const getColorClass = (docType) => {
                      if (docType.includes('pdf') || docType.includes('rti') || docType.includes('evidence')) return 'error-container';
                      if (docType.includes('image')) return 'secondary-container';
                      return 'primary-fixed';
                    };

                    const getTextColorClass = (docType) => {
                      if (docType.includes('pdf') || docType.includes('rti') || docType.includes('evidence')) return 'text-error';
                      if (docType.includes('image')) return 'text-on-secondary-container';
                      return 'text-on-primary-fixed';
                    };

                    return (
                      <div key={idx} className="group bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-md hover:bg-white border border-transparent hover:border-outline-variant/10">
                        <div className={`h-12 w-12 bg-${getColorClass(doc.document_type)} flex items-center justify-center rounded-lg ${getTextColorClass(doc.document_type)}`}>
                          <span className="material-symbols-outlined">{getFileIcon(doc.document_type)}</span>
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-primary">{doc.file_name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{doc.document_type.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-slate-500">
                            Uploaded: {formatDate(doc.created_at)}
                          </p>
                        </div>
                        <a 
                          href={doc.public_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-8 text-slate-500">
                    <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">folder_open</span>
                    <p className="text-sm">No documents or evidence attached yet</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <section className="bg-surface-container-highest/50 backdrop-blur rounded-xl p-6 border border-white/50">
              <h3 className="font-headline font-bold text-lg text-primary mb-6">Progress Overview</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Current Status</label>
                  <div className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-medium shadow-sm capitalize">
                    {complaint?.status?.replace(/_/g, ' ') || 'New'}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Overall Progress</label>
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-primary">{complaint?.progress_percentage || 0}%</span>
                      <span className="text-xs text-slate-500">Complete</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all shadow-sm"
                        style={{ width: `${complaint?.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">SLA Days Remaining</label>
                  <div className="text-lg font-bold text-primary">
                    {complaint?.sla_days || 30} days
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border-t-4 border-secondary-fixed">
              <h3 className="font-headline font-bold text-lg text-primary mb-6">Complaint Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed-dim">bookmark</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Category</p>
                    <p className="text-sm font-medium text-on-surface capitalize">{complaint?.category || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed-dim">schedule</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Submitted</p>
                    <p className="text-sm font-medium text-on-surface">{formatDate(complaint?.submitted_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed-dim">priority_high</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Priority</p>
                    <p className="text-sm font-medium text-on-surface capitalize">{complaint?.priority || 'Medium'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed-dim">assignment</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Reference ID</p>
                    <p className="text-sm font-medium text-on-surface font-mono">{complaint?.reference_id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

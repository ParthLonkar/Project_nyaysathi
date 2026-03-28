import React, { useState } from 'react';
import { complaintService } from '../services/complaint.service';

export default function ComplaintForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    attachment: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await complaintService.submitComplaint(formData);
      alert('Complaint submitted successfully!');
      setFormData({ title: '', description: '', category: 'general', attachment: null });
    } catch (err) {
      setError('Failed to submit complaint: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Submit a Legal Complaint</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="title" className="form-label">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Brief title of your complaint"
          className="input-field"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="form-label">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Detailed description of your complaint"
          rows="6"
          className="input-field"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="category" className="form-label">
          Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="input-field"
        >
          <option value="general">General</option>
          <option value="employment">Employment</option>
          <option value="consumer">Consumer Rights</option>
          <option value="family">Family Law</option>
          <option value="property">Property</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="attachment" className="form-label">
          Attachment
        </label>
        <input
          type="file"
          id="attachment"
          name="attachment"
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Submitting...' : 'Submit Complaint'}
      </button>
    </form>
  );
}

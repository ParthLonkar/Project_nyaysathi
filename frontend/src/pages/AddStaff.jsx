import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const initialFormState = {
  username: '',
  password: '',
  staff_name: '',
  email: '',
  position: '',
  phone: '',
  expertise_area: ''
};

export default function AddStaff() {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        staff_name: formData.staff_name,
        email: formData.email,
        position: formData.position,
        phone: formData.phone || undefined,
        expertise_area: formData.expertise_area || undefined
      };

      await api.post('/admin/add-staff', payload);
      setSuccess('Staff member added successfully.');
      setFormData(initialFormState);
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to add staff member.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-section bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="container-lg">
          <div className="mb-10">
            <span className="section-badge">Admin</span>
            <h1 className="section-header">Add Staff</h1>
            <p className="section-subheader">Create a new staff account with role and contact details.</p>
          </div>

          <div className="card p-8 max-w-3xl">
            {error && (
              <div className="alert alert-error mb-6">
                <div>
                  <p className="font-bold text-red-800">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-6">
                <div>
                  <p className="font-bold text-green-800">Success</p>
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label" htmlFor="staff_name">Full Name</label>
                  <input
                    id="staff_name"
                    name="staff_name"
                    type="text"
                    className="input-field"
                    value={formData.staff_name}
                    onChange={handleChange}
                    placeholder="Anita Sharma"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="position">Position</label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    className="input-field"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Legal Officer"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="input-field"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="anita.admin"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="anita@department.gov"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="input-field"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone (optional)</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="input-field"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expertise_area">Expertise Area (optional)</label>
                <input
                  id="expertise_area"
                  name="expertise_area"
                  type="text"
                  className="input-field"
                  value={formData.expertise_area}
                  onChange={handleChange}
                  placeholder="Family Law, Cybercrime, Consumer Rights"
                />
              </div>

              <div className="flex items-center gap-4">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Adding Staff...' : 'Add Staff'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setFormData(initialFormState)}
                  disabled={loading}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

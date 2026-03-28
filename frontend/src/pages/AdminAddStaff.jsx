import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { API_BASE_URL } from '../utils/api';
import StaffList from '../components/StaffList';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const initialState = {
  username: '',
  password: '',
  staff_name: '',
  email: '',
  position: '',
  phone: '',
  expertise_area: ''
};

export default function AdminAddStaff() {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const testInsertStaff = async () => {
    if (!supabase) {
      console.error('Supabase client not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    const { data, error: insertError } = await supabase.from('staff').insert([
      {
        username: 'debug_user_123',
        password_hash: '123456',
        staff_name: 'Debug User',
        email: 'debug123@gmail.com',
        position: 'Tester'
      }
    ]);

    console.log('DATA:', data);
    console.log('ERROR:', insertError);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/staff/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          staff_name: formData.staff_name,
          email: formData.email,
          position: formData.position,
          phone: formData.phone || undefined,
          expertise_area: formData.expertise_area || undefined
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to add staff member');
      }

      setSuccess('Staff member added successfully.');
      setFormData(initialState);
    } catch (err) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Staff Member</h1>
          <p className="text-gray-600 mt-2">Create new staff accounts and manage the staff directory.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-10">
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <input
                name="staff_name"
                value={formData.staff_name}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Position</label>
              <input
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Phone (optional)</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Expertise Area (optional)</label>
              <input
                name="expertise_area"
                value={formData.expertise_area}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? 'Adding...' : 'Add Staff'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={testInsertStaff}
              className="text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Test Supabase Insert (Debug Only)
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Staff List</h2>
          <StaffList />
        </div>
      </div>
    </div>
  );
}

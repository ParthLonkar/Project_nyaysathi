import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn, ArrowRight } from 'lucide-react';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/auth/staff/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('staffToken', data.token);
      localStorage.setItem('staffUser', JSON.stringify(data.staff));

      navigate('/staff/workspace');
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-2xl mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-900 flex items-center justify-center text-white shadow-lg">
              <LogIn className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-emerald-900 mb-2">Staff Login</h1>
          <p className="text-gray-600 text-lg">Field Officer Workspace</p>
        </div>

        {/* Login Card */}
        <div className="card p-10 shadow-xl">
          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-8">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-900">Login Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="form-group">
              <label className="form-label">👤 Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="staff_mc_001"
                className="input-field"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">🔐 Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input-field"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-tertiary w-full text-lg font-black py-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                <>
                  Login as Staff Officer
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-6 bg-emerald-50 rounded-xl border-2 border-emerald-200">
            <p className="text-sm font-black text-emerald-900 mb-3 uppercase tracking-wide">📋 Demo Credentials</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Username</p>
                <p className="font-mono text-sm font-black text-emerald-900">staff_mc_001</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Password</p>
                <p className="font-mono text-sm font-black text-emerald-900">test123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/login')}
            className="text-emerald-900 hover:text-emerald-700 font-bold text-lg transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            ← Back to Login Options
          </button>
        </div>
      </div>
    </div>
  );
}

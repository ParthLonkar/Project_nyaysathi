import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="bg-surface text-on-surface min-h-screen flex overflow-hidden">
      {/* Left Side: Branding Canvas - Hidden on Mobile */}
      <aside className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 bg-white overflow-hidden">
        {/* Background Imagery */}
        <div className="absolute inset-0 z-0">
          <img
            alt="white judicial columns"
            className="w-full h-full object-cover opacity-30"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbQbD_2qhAa31b2JQoNed-JtwTv6yQPuVFx2DdJoWjCSHs-dC7FuYT7ZW6DVYMl605k0joCd19MHULY5r5wQNCQZBDvLH94Sd0PbHq3IBtq2Za-oq3tjk991dmTKmOpzTa6OPTp-Moh2C5OfTWn_BHXOuyveCiBB_WEllur-ZOHIFVBMFMyLIUxtqab0b_7rMl2h3tRrS6UdXY7DS-QkrrpEA2XrThVMUEp5XTfJ2mBR3H0FYTwhBX1VbChca59tgTiVjG6tKnUuJL"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/80 to-transparent"></div>
        </div>

        {/* Top Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <span
              className="material-symbols-outlined text-tertiary text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              work
            </span>
            <span className="text-3xl font-extrabold tracking-tighter text-tertiary font-headline">
              NyaySathi
            </span>
          </div>
          <div className="space-y-6 max-w-lg">
            <h1 className="text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight">
              Field Officer <span className="text-tertiary">Portal</span>
            </h1>
            <p className="text-xl text-on-surface-variant font-medium leading-relaxed">
              Real-time complaint management and case coordination. Access your staff workspace to manage judicial processes.
            </p>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10">
          <div className="flex gap-8 text-sm font-semibold text-outline tracking-wider uppercase">
            <span>Efficiency</span>
            <span>Coordination</span>
            <span>Progress</span>
          </div>
        </div>
      </aside>

      {/* Right Side: Authentication Canvas */}
      <main className="w-full lg:w-1/2 bg-surface-container-low flex items-center justify-center p-6 md:p-12 relative">
        {/* Decoration for Mobile */}
        <div className="lg:hidden absolute top-12 left-12 flex items-center gap-2">
          <span
            className="material-symbols-outlined text-tertiary text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            work
          </span>
          <span className="text-xl font-bold tracking-tighter text-tertiary font-headline">
            NyaySathi
          </span>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-surface-container-lowest p-10 rounded-xl shadow-[0_32px_64px_-12px_rgba(25,28,29,0.04)] ring-1 ring-outline-variant/10">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-high rounded-full mb-6 text-tertiary">
              <span
                className="material-symbols-outlined text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                badge
              </span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface font-headline mb-2">
              Staff Login
            </h2>
            <p className="text-on-surface-variant text-sm">
              Secure access for field officers and coordinators
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg flex items-start gap-3">
              <span
                className="material-symbols-outlined text-error flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
              <div>
                <p className="text-xs font-bold text-error uppercase">Error</p>
                <p className="text-sm text-error/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form Section */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="space-y-2">
              <label
                className="text-xs font-bold uppercase tracking-widest text-outline ml-1"
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative group">
                <span
                  className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-tertiary transition-colors"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  person
                </span>
                <input
                  className="w-full bg-surface-container-highest border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-tertiary/10 focus:bg-surface-container-lowest transition-all"
                  id="username"
                  name="username"
                  placeholder="Enter your staff username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label
                  className="text-xs font-bold uppercase tracking-widest text-outline"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="text-xs font-semibold text-tertiary hover:underline"
                  href="#"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <span
                  className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-tertiary transition-colors"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  lock
                </span>
                <input
                  className="w-full bg-surface-container-highest border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-tertiary/10 focus:bg-surface-container-lowest transition-all"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              className="w-full bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary font-bold py-4 rounded-lg flex items-center justify-center gap-2 group hover:shadow-lg hover:shadow-tertiary/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Logging in...' : 'Login as Staff Officer'}</span>
              {!loading && (
                <span
                  className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  arrow_forward
                </span>
              )}
              {loading && (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  ></path>
                </svg>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-10 p-5 bg-surface-container-low rounded-lg border border-outline-variant/15">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="material-symbols-outlined text-secondary text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Demo Credentials
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-outline uppercase font-bold mb-1">User</p>
                <p className="text-sm font-mono text-on-surface font-semibold">staff_officer</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-bold mb-1">Pass</p>
                <p className="text-sm font-mono text-on-surface font-semibold">NyaySathi@2024</p>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-xs text-outline font-medium">
              Staff workspace access only. <br />
              IP: 192.168.1.104 |{' '}
              <a className="hover:text-tertiary underline transition-colors" href="#">
                Security Policy
              </a>
            </p>
          </div>
        </div>

        {/* Decorative Subtle Element */}
        <div className="absolute bottom-12 right-12 opacity-10 pointer-events-none hidden md:block">
          <img
            alt="judicial seal"
            className="w-32 h-32 object-contain grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8wOMzdL1iRzFAAlP0UPVFPNHSLUWtBSIKUrVOjxuW6jY3wJM3StD-FFKOQXTWBvjVvH49G94OCb2T_8x8CTIrMWb_THoNwTPb6ls1kh1aRce7wENGpox9rO_mlkvkk22V9AqEsDrjeAJU2bF_uvGGnBiq_Njisds0fAkVjB7mYo5PMv2Rw74nSE5Lt7lv5M61VD9Hy8tOoLIp9s8o0lB7LwZIcO402cr-f-SdzSxIT7ZjLYxedKpJBzM4u0U83uIV6-uIhPXjykY0"
          />
        </div>
      </main>
    </div>
  );
}

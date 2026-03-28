import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter text-blue-900">
          NyaySathi
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 font-semibold tracking-tight">
          <a href="#features" className="text-slate-600 hover:text-blue-900 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-slate-600 hover:text-blue-900 transition-colors">
            How It Works
          </a>
          <Link to="/" className="text-slate-600 hover:text-blue-900 transition-colors">
            About
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden lg:block px-5 py-2 text-blue-900 font-semibold border border-blue-900/20 rounded-lg hover:bg-blue-50 transition-all"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/submit')}
            className="bg-blue-900 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:scale-[1.02] transition-all"
          >
            File Complaint
          </button>
        </div>
      </div>
    </nav>
  );
}

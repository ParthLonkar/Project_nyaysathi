import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          NyaySathi
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 font-semibold tracking-tight">
          {isHome && (
            <>
              <a href="#features" className="text-slate-600 hover:text-blue-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-600 hover:text-blue-900 transition-colors">
                How It Works
              </a>
            </>
          )}
          <Link to="/" className="text-slate-600 hover:text-blue-900 transition-colors">
            Home
          </Link>
          <button
            onClick={() => {
              const id = prompt('Enter your Complaint Reference ID:');
              if (id) navigate(`/track/${id}`);
            }}
            className="text-slate-600 hover:text-blue-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
          >
             Track Complaint
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="hidden lg:block px-6 py-2.5 text-blue-900 font-semibold border-2 border-blue-900 rounded-xl hover:bg-blue-50 transition-all duration-200"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/submit')}
            className="bg-gradient-to-r from-blue-600 to-blue-900 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            File Complaint
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4">
          {isHome && (
            <>
              <a href="#features" className="block text-slate-600 hover:text-blue-900 transition-colors font-semibold">
                Features
              </a>
              <a href="#how-it-works" className="block text-slate-600 hover:text-blue-900 transition-colors font-semibold">
                How It Works
              </a>
            </>
          )}
          <Link to="/" className="block text-slate-600 hover:text-blue-900 transition-colors font-semibold">
            Home
          </Link>
          <button
            onClick={() => {
              const id = prompt('Enter your Complaint Reference ID:');
              if (id) navigate(`/track/${id}`);
            }}
            className="block w-full text-left text-slate-600 hover:text-blue-900 transition-colors font-semibold px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            🔍 Track Complaint
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-2.5 text-blue-900 font-semibold border-2 border-blue-900 rounded-xl hover:bg-blue-50 transition-all"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
}


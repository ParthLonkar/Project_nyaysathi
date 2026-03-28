import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === '/';

  return (
    <nav className="w-full border-b border-outline-variant/15 bg-surface-bright shadow-[0_2px_8px_rgba(25,28,29,0.04)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity"
          onClick={() => navigate('/')}
        >
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 0" }}>
            account_balance
          </span>
          <h1 className="font-headline font-black text-xl tracking-tighter text-primary hidden sm:block">
            NyaySathi
          </h1>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => navigate('/')}
            className="font-body font-medium text-on-surface hover:text-primary transition-colors text-sm bg-none border-none cursor-pointer p-0"
          >
            Home
          </button>
          {isHome && (
            <>
              <a
                href="#features"
                className="font-body font-medium text-on-surface hover:text-primary transition-colors text-sm"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="font-body font-medium text-on-surface hover:text-primary transition-colors text-sm"
              >
                How It Works
              </a>
            </>
          )}
          <button
            onClick={() => {
              const id = prompt('Enter your Complaint Reference ID:');
              if (id) navigate(`/track/${encodeURIComponent(id.trim())}`);
            }}
            className="font-body font-medium text-on-surface hover:text-primary transition-colors text-sm bg-none border-none cursor-pointer p-0"
          >
            Track Complaint
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/login')}
            className="hidden lg:block px-4 py-2 text-sm font-semibold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-200"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/submit')}
            className="px-4 py-2 text-sm font-bold text-on-primary bg-primary rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-200"
          >
            File Complaint
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-on-surface"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant/15 px-6 py-4 space-y-3">
          <button
            onClick={() => {
              navigate('/');
              setMobileOpen(false);
            }}
            className="block w-full text-left font-body font-medium text-on-surface hover:text-primary transition-colors text-sm bg-none border-none cursor-pointer p-2 rounded-lg hover:bg-surface-container"
          >
            Home
          </button>
          {isHome && (
            <>
              <a
                href="#features"
                onClick={() => setMobileOpen(false)}
                className="block font-body font-medium text-on-surface hover:text-primary transition-colors text-sm p-2 rounded-lg hover:bg-surface-container"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="block font-body font-medium text-on-surface hover:text-primary transition-colors text-sm p-2 rounded-lg hover:bg-surface-container"
              >
                How It Works
              </a>
            </>
          )}
          <button
            onClick={() => {
              const id = prompt('Enter your Complaint Reference ID:');
              if (id) navigate(`/track/${encodeURIComponent(id.trim())}`);
              setMobileOpen(false);
            }}
            className="block w-full text-left font-body font-medium text-on-surface hover:text-primary transition-colors text-sm bg-none border-none cursor-pointer p-2 rounded-lg hover:bg-surface-container"
          >
            🔍 Track Complaint
          </button>
          <div className="border-t border-outline-variant/15 pt-3 space-y-3">
            <button
              onClick={() => {
                navigate('/login');
                setMobileOpen(false);
              }}
              className="w-full px-4 py-2 text-sm font-semibold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-on-primary transition-all"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate('/submit');
                setMobileOpen(false);
              }}
              className="w-full px-4 py-2 text-sm font-bold text-on-primary bg-primary rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all"
            >
              File Complaint
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}


import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center text-2xl font-bold text-blue-600">
            ⚖️ NyaySathi
          </Link>
          <ul className="flex list-none gap-8">
            <li className="nav-item">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/submit" className="text-gray-700 hover:text-blue-600 transition-colors">
                File Complaint
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

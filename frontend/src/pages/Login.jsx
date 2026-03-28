import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';

export default function Login() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="bg-gradient-to-b from-blue-50 via-white to-teal-50 py-16 md:py-32">
        <div className="container-lg">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="section-badge">🔐 Secure Access Portal</div>
            <h1 className="section-header mb-4">Choose Your Account Type</h1>
            <p className="section-subheader">Select your role to access the platform</p>
          </div>

          {/* Login Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Admin Login Card */}
            <div
              onClick={() => navigate('/admin/login')}
              className="card cursor-pointer hover:scale-[1.02] hover:shadow-2xl group transition-all duration-300"
            >
              <div className="p-10">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Shield className="w-12 h-12 text-blue-900" strokeWidth={1.5} />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-center text-blue-900 mb-4">
                  Department Admin
                </h2>
                <p className="text-center text-slate-600 mb-8 leading-relaxed">
                  Manage complaints, assign staff, track progress, and generate insights from your department's grievance data.
                </p>
                <div className="text-center text-sm text-slate-600 mb-6 font-mono bg-gray-100 p-4 rounded-xl border border-gray-200">
                  <p className="mb-2">Demo Credentials:</p>
                  <p>Username: <strong>admin_mc</strong></p>
                  <p>Password: <strong>test123</strong></p>
                </div>
                <button className="w-full btn-primary group flex items-center justify-center gap-2">
                  Admin Login
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Staff Login Card */}
            <div
              onClick={() => navigate('/staff/login')}
              className="card cursor-pointer hover:scale-[1.02] hover:shadow-2xl group transition-all duration-300"
            >
              <div className="p-10">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="w-12 h-12 text-emerald-900" strokeWidth={1.5} />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-center text-emerald-900 mb-4">
                  Field Officer
                </h2>
                <p className="text-center text-slate-600 mb-8 leading-relaxed">
                  View assigned complaint cases, schedule field visits, update status, and communicate directly with citizens.
                </p>
                <div className="text-center text-sm text-slate-600 mb-6 font-mono bg-gray-100 p-4 rounded-xl border border-gray-200">
                  <p className="mb-2">Demo Credentials:</p>
                  <p>Username: <strong>staff_mc_001</strong></p>
                  <p>Password: <strong>test123</strong></p>
                </div>
                <button className="w-full btn-tertiary group flex items-center justify-center gap-2">
                  Staff Login
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/')}
              className="text-blue-900 hover:text-blue-700 font-semibold text-lg transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

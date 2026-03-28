import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">⚖️ NyaySathi - AI-Powered Legal Justice Platform</h1>
        <p className="text-xl mb-8 opacity-90">Your AI-powered assistant for legal complaints and justice</p>
        <button
          onClick={() => navigate('/submit')}
          className="btn-primary bg-white text-blue-600 hover:bg-gray-100"
        >
          File a Complaint Now
        </button>
      </header>

      <section className="py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="card p-6 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-blue-600 mb-3">🤖 AI Analysis</h3>
            <p className="text-gray-600">Advanced AI agents analyze your complaint for legal merit and compliance</p>
          </div>
          <div className="card p-6 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-blue-600 mb-3">📋 Legal Drafting</h3>
            <p className="text-gray-600">Automatic drafting of legal documents and formal complaints</p>
          </div>
          <div className="card p-6 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-blue-600 mb-3">⚡ Priority Detection</h3>
            <p className="text-gray-600">Intelligent prioritization based on severity and urgency</p>
          </div>
          <div className="card p-6 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-blue-600 mb-3">📊 Real-time Tracking</h3>
            <p className="text-gray-600">Monitor your complaint status and AI analysis in real-time</p>
          </div>
        </div>
      </section>
    </div>
  );
}

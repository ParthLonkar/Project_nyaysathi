import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { CheckCircle, AlertCircle, Zap, Shield, Clock } from 'lucide-react';

export default function SubmissionConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [complaintData, setComplaintData] = useState(null);

  useEffect(() => {
    if (location.state?.complaint) {
      setComplaintData(location.state.complaint);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  if (!complaintData) {
    return (
      <Layout>
        <div className="page-section flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const complaintId = `NYA-${Date.now().toString().slice(-8)}`;

  return (
    <Layout>
      <div className="page-section bg-gradient-to-b from-green-50 via-blue-50/30 to-white">
        <div className="container-lg">
          {/* Success Animation */}
          <div className="flex justify-center mb-12">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse opacity-30"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse opacity-20 animation-delay-100"></div>
              <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-16 h-16 text-green-600" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-16">
            <h1 className="section-header mb-4 text-green-900">Complaint Submitted Successfully!</h1>
            <p className="section-subheader text-lg">
              Your complaint has been received and is now being processed by our AI system. A confirmation email has been sent to <strong>{complaintData.email}</strong>
            </p>
          </div>

          {/* Complaint ID Card - Premium */}
          <div className="card-premium p-12 shadow-2xl mb-12 border-2 border-green-300">
            <div className="text-center mb-10">
              <p className="text-blue-700 mb-4 font-bold text-sm uppercase tracking-widest">Your Complaint Reference ID</p>
              <div className="text-5xl font-black tracking-widest mb-4 font-mono text-blue-900 bg-white p-6 rounded-xl inline-block border-2 border-blue-200">{complaintId}</div>
              <p className="text-blue-600 text-sm font-semibold mt-4">Save this ID to track your complaint</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-blue-200">
              <button
                onClick={() => navigator.clipboard.writeText(complaintId)}
                className="btn-primary flex items-center justify-center gap-2"
              >
                📋 Copy ID
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                🖨️ Print Confirmation
              </button>
            </div>
          </div>

          {/* Complaint Summary & Next Steps */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Left - Complaint Details */}
            <div className="card p-10">
              <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <span className="text-3xl">📋</span> Complaint Details
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-wide mb-2">Category</p>
                  <p className="text-lg text-gray-900 font-black">{complaintData.category || 'General'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-wide mb-2">Subject</p>
                  <p className="text-lg text-gray-900 font-bold">{complaintData.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-wide mb-2">Against</p>
                  <p className="text-lg text-gray-900 font-bold">{complaintData.respondentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-wide mb-2">Date of Incident</p>
                  <p className="text-lg text-gray-900 font-bold">{complaintData.incidentDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-wide mb-2">Location</p>
                  <p className="text-lg text-gray-900 font-bold">{complaintData.location}</p>
                </div>
              </div>
            </div>

            {/* Right - What Happens Next */}
            <div className="card p-10">
              <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <span className="text-3xl">🚀</span> What Happens Next
              </h3>
              <div className="space-y-5">
                {[
                  { num: 1, title: 'AI Analysis', time: '5 mins', desc: 'Deep legal analysis & categorization' },
                  { num: 2, title: 'Document Generation', time: '10 mins', desc: 'Legal documents drafted' },
                  { num: 3, title: 'Department Routing', time: '15 mins', desc: 'Routed to relevant dept' },
                  { num: 4, title: 'Officer Assignment', time: '24 hrs', desc: 'Assigned for review' }
                ].map((step) => (
                  <div key={step.num} className="flex gap-4 pb-5 border-b border-gray-200 last:border-b-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-900 text-sm">{step.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                      <p className="text-xs text-blue-600 font-bold mt-2">⏱️ {step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="card-premium p-10 mb-12 border-2 border-blue-300">
            <h3 className="text-2xl font-black text-blue-900 mb-8">📌 Important Information</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="text-3xl">📧</div>
                <div>
                  <p className="font-bold text-blue-900 mb-2">Confirmation Email</p>
                  <p className="text-blue-700 text-sm">A detailed confirmation with all documents has been sent to your email.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">📊</div>
                <div>
                  <p className="font-bold text-blue-900 mb-2">Track Anytime</p>
                  <p className="text-blue-700 text-sm">Use your complaint ID to track progress 24/7 on our dashboard.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">⏰</div>
                <div>
                  <p className="font-bold text-blue-900 mb-2">Expected Timeline</p>
                  <p className="text-blue-700 text-sm">Initial response within 5 business days. Full resolution in 15-90 days.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">🔒</div>
                <div>
                  <p className="font-bold text-blue-900 mb-2">Bank-Grade Security</p>
                  <p className="text-blue-700 text-sm">AES-256 encryption. Only authorized officers can access your data.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <button
              onClick={() => navigate(`/track/${complaintId}`)}
              className="btn-primary text-lg font-black py-5 flex items-center justify-center gap-3"
            >
              <span>🔍</span> Track This Complaint
            </button>
            <button
              onClick={() => navigate(`/dashboard`)}
              className="btn-secondary text-lg font-black py-5 flex items-center justify-center gap-3"
            >
              <span>📊</span> View Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-outline text-lg font-black py-5 flex items-center justify-center gap-3"
            >
              <span>←</span> Back to Home
            </button>
          </div>

          {/* FAQ Section */}
          <div className="card p-12 mb-12">
            <h3 className="text-3xl font-black text-gray-900 mb-10">❓ Frequently Asked Questions</h3>
            <div className="space-y-8">
              {[
                {
                  q: 'Can I modify my complaint after submission?',
                  a: 'You can add supplementary information within 7 days. Contact support with your complaint ID for modifications.'
                },
                {
                  q: 'What if my complaint is rejected?',
                  a: 'You\'ll receive a detailed reason and guidance on how to refile with corrections. Support will be available to help.'
                },
                {
                  q: 'How do I check the status of my complaint?',
                  a: 'Use your complaint ID to check status anytime in your dashboard. We also send email updates at key milestones.'
                },
                {
                  q: 'What if the department doesn\'t respond on time?',
                  a: 'Our system automatically escalates to higher authorities if SLA is breached and generates follow-up notices.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <p className="font-black text-lg text-gray-900 mb-3 flex items-start gap-2">
                    <span className="text-blue-600">Q:</span> {faq.q}
                  </p>
                  <p className="text-gray-700 leading-relaxed flex items-start gap-2">
                    <span className="text-green-600 font-bold">A:</span> {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Support Footer */}
          <div className="text-center border-t border-gray-200 pt-12">
            <h3 className="text-2xl font-black text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-6">Our support team is available 24/7 to assist you</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="mailto:support@nyaysathi.com" className="btn-primary inline-flex items-center gap-2">
                📧 support@nyaysathi.com
              </a>
              <a href="tel:+918000000000" className="btn-secondary inline-flex items-center gap-2">
                📞 1800-NYAY-SAT
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

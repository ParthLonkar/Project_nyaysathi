import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../services/complaint.service';
import StarterChips from './intake/StarterChips';
import VoiceInputButton from './intake/VoiceInputButton';
import AttachmentUploader from './intake/AttachmentUploader';

export default function ComplaintForm() {
  const navigate = useNavigate();
  const [complaintText, setComplaintText] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStarter = (topic) => {
    const starter = `I want to report a ${topic.toLowerCase()} in my area. `;
    setComplaintText((prev) => (prev ? `${prev}\n${starter}` : starter));
  };

  const handleVoiceTranscript = (text) => {
    setComplaintText((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!complaintText.trim()) {
      setError('Please describe your problem before submitting.');
      return;
    }
    if (!location.trim()) {
      setError('Please add your area/location.');
      return;
    }

    setLoading(true);
    try {
      const response = await complaintService.submitComplaint({
        complaintText,
        name,
        phone,
        location,
        attachments,
      });

      navigate('/submission-confirmation', {
        state: {
          complaint: {
            complaintId: response?.caseId || `NYA-${Date.now().toString().slice(-8)}`,
            submittedAt: new Date().toISOString(),
            complaintText,
            name,
            phone,
            location,
            attachments,
            aiResult: response?.aiResult || null,
            citizen_update: response?.aiResult?.citizen_update || null,
          },
        },
      });
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message;
      setError(`Failed to submit complaint: ${message}`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-4">
            AI-Powered Intake
          </p>
          <h1 className="text-4xl lg:text-5xl font-black text-blue-900 tracking-tight mb-4">
            Describe Your Civic or Legal Problem
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Type or speak your complaint. NyaySathi AI will identify the department, legal path, and next steps.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Your Complaint</label>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                rows={10}
                placeholder="Example: There has been no water supply in Sector 9 for 4 days. We complained to local officers but no action has been taken. Elderly people and children are affected. Please help escalate this urgently."
                className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 p-4 text-gray-900 leading-relaxed"
              />
            </div>

            <div>
              <p className="text-sm font-bold text-gray-800 mb-2">Quick starters</p>
              <StarterChips onSelect={handleStarter} />
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <p className="text-sm font-bold text-blue-900 mb-2">Voice Input</p>
              <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={loading} />
            </div>

            <div>
              <p className="text-sm font-bold text-gray-800 mb-2">Attachments (Optional)</p>
              <AttachmentUploader files={attachments} onChange={setAttachments} />
              <p className="text-xs text-gray-500 mt-2">
                Files are captured for submission context. Storage wiring can be expanded later without changing this UX.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location / Area</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Sector, ward, locality"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white font-black text-lg py-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting & Analyzing...' : 'Submit Complaint to NyaySathi AI'}
            </button>
          </form>

          <aside className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-black text-gray-900 mb-3">How AI Helps</h2>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-700">1.</span>
                  <span>Intake Agent understands your text/voice complaint.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-700">2.</span>
                  <span>Legal Intelligence Agent detects department and legal path.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-700">3.</span>
                  <span>Document Intelligence Agent drafts action-ready complaint context.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-700">4.</span>
                  <span>Action Agent routes the case and generates case ID.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-2xl p-6 shadow-xl">
              <p className="text-sm uppercase tracking-wide opacity-80 mb-2">Trust & Privacy</p>
              <p className="text-sm leading-relaxed opacity-95">
                Your submission is used only for grievance resolution. Sensitive details are processed securely and shared with relevant authorities only.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

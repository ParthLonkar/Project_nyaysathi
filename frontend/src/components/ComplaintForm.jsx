import React, { useState } from 'react';
import { complaintService } from '../services/complaint.service';

export default function ComplaintForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    fullName: '',
    email: '',
    phone: '',
    respondentName: '',
    incidentDate: '',
    attachment: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const categories = [
    { value: 'consumer', label: 'Consumer Rights', icon: '🛒' },
    { value: 'employment', label: 'Employment Issues', icon: '💼' },
    { value: 'property', label: 'Property Disputes', icon: '🏠' },
    { value: 'family', label: 'Family Law', icon: '👨‍👩‍👧' },
    { value: 'harassment', label: 'Harassment', icon: '⚠️' },
    { value: 'other', label: 'Other', icon: '📋' },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleCategoryClick = (categoryValue) => {
    setFormData(prev => ({
      ...prev,
      category: categoryValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await complaintService.submitComplaint(formData);
      setSuccess(true);
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          category: 'general',
          fullName: '',
          email: '',
          phone: '',
          respondentName: '',
          incidentDate: '',
          attachment: null,
        });
        setStep(1);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to submit complaint: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-white via-blue-50/30 to-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">
            📝 File Your Complaint
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-blue-900 mb-6 tracking-tight">
            Submit Your Legal Complaint
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our AI-powered system will analyze your complaint, identify applicable laws, and generate perfect legal documents instantly.
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-3xl flex items-center gap-4 shadow-lg">
            <div className="text-5xl">✅</div>
            <div>
              <h3 className="text-xl font-black text-green-900 mb-1">Complaint Submitted Successfully!</h3>
              <p className="text-green-700">Your complaint reference ID will be sent to your email. Our AI is analyzing your case now.</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-3xl flex items-center gap-4 shadow-lg">
            <div className="text-5xl">⚠️</div>
            <div>
              <h3 className="text-xl font-black text-red-900 mb-1">Submission Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-12">
            {/* Circle 1 */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-lg transition-all ${
                  step >= 1
                    ? 'bg-gradient-to-br from-blue-600 to-teal-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                1
              </div>
              <p className={`mt-4 text-sm font-bold transition-colors ${step >= 1 ? 'text-blue-900' : 'text-gray-500'}`}>
                Your Details
              </p>
            </div>

            {/* Line 1 */}
            <div className={`flex-1 h-1 mx-2 transition-all rounded-full ${
              step > 1 ? 'bg-gradient-to-r from-blue-600 to-teal-600' : 'bg-gray-300'
            }`}></div>

            {/* Circle 2 */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-lg transition-all ${
                  step >= 2
                    ? 'bg-gradient-to-br from-blue-600 to-teal-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
              <p className={`mt-4 text-sm font-bold transition-colors ${step >= 2 ? 'text-blue-900' : 'text-gray-500'}`}>
                Complaint Details
              </p>
            </div>

            {/* Line 2 */}
            <div className={`flex-1 h-1 mx-2 transition-all rounded-full ${
              step > 2 ? 'bg-gradient-to-r from-blue-600 to-teal-600' : 'bg-gray-300'
            }`}></div>

            {/* Circle 3 */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-lg transition-all ${
                  step >= 3
                    ? 'bg-gradient-to-br from-blue-600 to-teal-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                3
              </div>
              <p className={`mt-4 text-sm font-bold transition-colors ${step >= 3 ? 'text-blue-900' : 'text-gray-500'}`}>
                Review & Submit
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 lg:p-16 backdrop-blur-sm">
          {/* STEP 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-10 animate-fadeIn">
              <div className="mb-10">
                <h2 className="text-4xl font-black text-blue-900 mb-3">Your Information</h2>
                <p className="text-lg text-gray-600">Help us understand who you are so we can better assist you.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 font-medium"
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                <p className="text-base text-blue-900 font-medium">
                  <span className="text-2xl mr-3">🔒</span><strong>Privacy Assured:</strong> Your information is encrypted with AES-256 bank-grade security. We never share your data with third parties.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all mt-8"
              >
                Continue to Complaint Details →
              </button>
            </div>
          )}

          {/* STEP 2: Complaint Information */}
          {step === 2 && (
            <div className="space-y-10 animate-fadeIn">
              <div className="mb-10">
                <h2 className="text-4xl font-black text-blue-900 mb-3">Tell Us About Your Complaint</h2>
                <p className="text-lg text-gray-600">Provide as much detail as possible so our AI can analyze your case accurately.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-6">Category of Complaint *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryClick(cat.value)}
                      className={`p-6 rounded-2xl border-2 transition-all text-center font-semibold shadow-md ${
                        formData.category === cat.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-lg scale-105'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                      }`}
                    >
                      <div className="text-4xl mb-2">{cat.icon}</div>
                      <div className="text-xs font-bold">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Complaint Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Brief title of your complaint"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Detailed Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Provide a detailed account of what happened. Include dates, amounts, names of people involved."
                  rows="6"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 font-medium resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">💡 More details = Better AI analysis</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Person/Entity Being Complained Against *</label>
                  <input
                    type="text"
                    name="respondentName"
                    value={formData.respondentName}
                    onChange={handleChange}
                    required
                    placeholder="Name or company name"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">When Did This Happen? *</label>
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-900 py-5 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                >
                  Review & Submit →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-10 animate-fadeIn">
              <div className="mb-10">
                <h2 className="text-4xl font-black text-blue-900 mb-3">Review Your Complaint</h2>
                <p className="text-lg text-gray-600">Please review your information before submitting.</p>
              </div>

              {/* Summary Cards */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-10 rounded-2xl border-2 border-blue-200">
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-6">Your Information</h3>
                  <div className="space-y-4 text-blue-900">
                    <div className="text-sm"><span className="font-bold">👤 Name:</span> {formData.fullName}</div>
                    <div className="text-sm"><span className="font-bold">📧 Email:</span> {formData.email}</div>
                    <div className="text-sm"><span className="font-bold">📱 Phone:</span> {formData.phone}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-10 rounded-2xl border-2 border-teal-200">
                  <h3 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-6">Complaint Details</h3>
                  <div className="space-y-4 text-teal-900">
                    <div className="text-sm"><span className="font-bold">📂 Category:</span> {categories.find(c => c.value === formData.category)?.label}</div>
                    <div className="text-sm"><span className="font-bold">📝 Title:</span> {formData.title}</div>
                    <div className="text-sm"><span className="font-bold">⚖️ Against:</span> {formData.respondentName}</div>
                    <div className="text-sm"><span className="font-bold">📅 Date:</span> {formData.incidentDate}</div>
                  </div>
                </div>
              </div>

              {/* Description Preview */}
              <div className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-200">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Your Statement</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm max-h-48 overflow-y-auto bg-white p-6 rounded-xl border border-gray-200">
                  {formData.description}
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-4">Supporting Documents (Optional)</label>
                <div className="border-3 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:bg-blue-50 transition-colors cursor-pointer bg-gradient-to-br from-blue-50/50 to-transparent">
                  <input
                    type="file"
                    name="attachment"
                    onChange={handleChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="text-5xl mb-3">📎</div>
                    <p className="text-gray-900 font-bold text-lg">Upload supporting documents</p>
                    <p className="text-sm text-gray-600 mt-2">PDF, DOC, Images (Max 10MB)</p>
                  </label>
                  {formData.attachment && (
                    <p className="mt-6 text-sm text-green-600 font-bold bg-green-50 p-3 rounded-xl inline-block">
                      ✓ {formData.attachment.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Confirmation */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-10 rounded-2xl border-2 border-green-200">
                <div className="flex items-start gap-4">
                  <div className="text-5xl flex-shrink-0">✅</div>
                  <div>
                    <h3 className="font-black text-green-900 mb-2 text-lg">Ready to Submit?</h3>
                    <p className="text-green-700 text-sm leading-relaxed">
                      Our 6-agent AI system will immediately analyze your complaint, identify applicable laws, draft perfect legal documents, and provide a complete action plan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border-2 border-gray-300 text-gray-900 py-5 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all"
                >
                  ← Edit Details
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? '⏳ Submitting...' : '✓ Submit Complaint'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Support Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all">
            <div className="text-5xl mb-4">💡</div>
            <h3 className="font-black text-gray-900 mb-3 text-lg">AI-Guided Process</h3>
            <p className="text-sm text-gray-600 leading-relaxed">Our intelligent system guides you through each step with smart suggestions and real-time validations.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="font-black text-gray-900 mb-3 text-lg">Instant Analysis</h3>
            <p className="text-sm text-gray-600 leading-relaxed">Get AI-powered legal analysis and document generation in minutes, not days.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="font-black text-gray-900 mb-3 text-lg">100% Secure</h3>
            <p className="text-sm text-gray-600 leading-relaxed">AES-256 bank-grade encryption protects all your sensitive legal information.</p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-12 text-white text-center shadow-2xl mb-12">
          <h3 className="text-3xl font-black mb-3">Questions?</h3>
          <p className="text-lg opacity-90 mb-6">Our support team is here to help. Contact us at support@nyaysathi.com or call 1800-NYAY-SAT</p>
          <a href="mailto:support@nyaysathi.com" className="inline-block px-8 py-3 bg-white text-blue-900 rounded-2xl font-bold hover:scale-105 transition-transform">
            Get Support
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, Phone, MapPin, Calendar, Edit2, Lock, Activity, Target } from 'lucide-react';
import { API_BASE_URL } from '../utils/api.js';
import { EditProfileModal, ChangePasswordModal } from '../components/ProfileModals.jsx';

export default function StaffProfile() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const staffData = localStorage.getItem('staffUser');
    if (!staffData) {
      navigate('/staff/login');
      return;
    }
    setStaff(JSON.parse(staffData));
    fetchProfileData();
  }, [navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('staffToken');

      // Fetch profile
      const profileRes = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (profileRes.ok) {
        const { user } = await profileRes.json();
        setProfile(user);
      }

      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/user/performance`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (statsRes.ok) {
        const { stats: data } = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    navigate('/staff/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="text-lg">Loading...</div></div>;
  }

  if (!profile) {
    return <div className="text-center py-8 text-red-600">Failed to load profile</div>;
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
  const displayName = profile?.staff_name || 'Staff';
  const firstLetter = displayName?.charAt(0).toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Staff Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="max-w-6xl mx-auto mt-4 p-4 bg-green-50 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="max-w-6xl mx-auto mt-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-8 rounded-lg mb-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-4xl font-bold">{firstLetter}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <p className="text-green-100">Position: {profile.position || 'N/A'}</p>
                <p className="text-green-100 text-sm">Department: {profile?.department_name || profile?.department_code || 'N/A'}</p>
                <p className="text-green-100 text-sm">Member since {formatDate(profile.created_at)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 font-semibold"
              >
                <Lock className="w-4 h-4" />
                Password
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {['overview', 'contact', 'performance'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Work Overview</h2>
                {profile.expertise_area && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Expertise Area</p>
                    <p className="font-semibold text-gray-900">{profile.expertise_area}</p>
                  </div>
                )}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                      <p className="text-sm text-gray-600 flex items-center gap-2"><Target className="w-4 h-4" /> Assigned</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{stats.assigned}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                      <p className="text-sm text-gray-600 flex items-center gap-2"><Activity className="w-4 h-4" /> Resolved</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                      <p className="text-sm text-gray-600">Performance Score</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">{Math.round(stats.performance_score || 0)}%</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                    <Mail className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{profile.email || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                    <Phone className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                    <MapPin className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-semibold text-gray-900">{staff?.department_name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                    <Calendar className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-semibold text-gray-900">{formatDate(profile.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && stats && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Total Resolved</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_resolved || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Avg Resolution Time</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(stats.average_resolution_time || 0)} hrs</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Current Load</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.assigned} cases</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        userType="staff"
        currentUser={profile}
        onSuccess={() => {
          setSuccessMessage('Profile updated successfully!');
          fetchProfileData();
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userType="staff"
        onSuccess={(msg) => {
          setSuccessMessage(msg);
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
      />
    </div>
  );
}

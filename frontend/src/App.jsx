import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import PortalSelection from './pages/PortalSelection';
import SubmitComplaint from './pages/SubmitComplaint';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import StaffLogin from './pages/StaffLogin';
import StaffWorkspace from './pages/StaffWorkspace';
import ComplaintDetails from './pages/ComplaintDetails';
import CaseTracking from './pages/CaseTracking';
import SubmissionConfirmation from './pages/SubmissionConfirmation';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Citizen Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PortalSelection />} />
          <Route path="/portals" element={<PortalSelection />} />
          <Route path="/submit" element={<SubmitComplaint />} />
          <Route path="/submission-confirmation" element={<SubmissionConfirmation />} />
          <Route path="/track/:complaintId" element={<CaseTracking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/complaint/:id" element={<ComplaintDetails />} />
          
          {/* Portal Selection */}
          <Route path="/portals" element={<PortalSelection />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          
          {/* Staff Routes */}
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff/workspace" element={<StaffWorkspace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

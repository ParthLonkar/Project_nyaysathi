import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SubmitComplaint from './pages/SubmitComplaint';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ComplaintDetails from './pages/ComplaintDetails';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<SubmitComplaint />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/complaint/:id" element={<ComplaintDetails />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

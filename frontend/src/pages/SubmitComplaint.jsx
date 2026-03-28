import React from 'react';
import ComplaintForm from '../components/ComplaintForm';

export default function SubmitComplaint() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ComplaintForm />
      </div>
    </div>
  );
}

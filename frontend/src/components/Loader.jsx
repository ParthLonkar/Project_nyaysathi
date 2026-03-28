import React from 'react';

export default function Loader() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full spinner"></div>
      <p className="mt-6 text-lg text-gray-600">Processing your complaint with AI...</p>
    </div>
  );
}

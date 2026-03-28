import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../utils/api';

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/staff`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch staff list');
        }

        const payload = await response.json();
        setStaff(payload.staff || []);
      } catch (err) {
        setError('Unable to load staff list.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading) {
    return <div className="text-gray-600">Loading staff...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>;
  }

  if (staff.length === 0) {
    return <div className="text-gray-600 text-sm">No staff members found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">Position</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">Phone</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-semibold text-gray-900">{member.staff_name}</td>
              <td className="px-4 py-2 text-gray-600">{member.email}</td>
              <td className="px-4 py-2 text-gray-600">{member.position}</td>
              <td className="px-4 py-2 text-gray-600">{member.phone || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

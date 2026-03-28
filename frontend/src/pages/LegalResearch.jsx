import React, { useState } from 'react';
import { apiCall } from '../utils/api';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'civil', label: 'Civil' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'labor', label: 'Labor' },
  { value: 'consumer', label: 'Consumer' },
];

export default function LegalResearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);

      const response = await apiCall(`/legal-research?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch legal research');
      }
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Unable to fetch legal research results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Legal Research</h1>
          <p className="text-gray-600 mt-2">Search legal topics, acts, and precedents.</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., consumer protection act"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading && (
            <div className="text-gray-600">Loading results...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="text-gray-600">No results found. Try a different keyword.</div>
          )}
          {results.map((item, idx) => (
            <div key={`${item.title}-${idx}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 mt-2">{item.summary}</p>
                  <p className="text-sm text-gray-500 mt-3">
                    Category: <span className="font-semibold">{item.category || 'General'}</span> · Source: {item.source || 'Internal'}
                  </p>
                </div>
                <button className="text-indigo-600 font-semibold hover:text-indigo-800">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

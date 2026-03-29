import React, { useState, useEffect } from 'react';

const sampleLegalData = [
  {
    id: 1,
    title: 'Consumer Protection Act, 2019',
    category: 'consumer',
    type: 'Act',
    summary: 'Provides protection to consumers against unfair trade practices and product liability.',
    fullText: 'The Consumer Protection Act, 2019 empowers consumers with protection against unfair trade practices and ensures product liability.',
    citations: 245,
    recentCases: 12,
    bookmarked: false,
    lastUpdated: '2026-03-15',
    provisions: ['Right to Safety', 'Right to Information', 'Right to Choice', 'Right to Remedies'],
    references: ['Section 2(7)', 'Chapter II', 'Chapter III'],
  },
  {
    id: 2,
    title: 'Indian Penal Code - Section 420',
    category: 'criminal',
    type: 'Precedent',
    summary: 'Cheating and dishonestly inducing delivery of property - Punishment up to 7 years imprisonment.',
    fullText: 'Section 420 IPC deals with cheating by personation or by knowingly inducing delivery of property as a result of cheating.',
    citations: 1823,
    recentCases: 156,
    bookmarked: false,
    lastUpdated: '2026-02-20',
    provisions: ['Punishment: 7 years', 'Fine: Up to 1 lakh', 'Both imprisonment and fine'],
    references: ['IPC 420', 'Related: 419, 421, 422'],
  },
  {
    id: 3,
    title: 'Right to Information Act, 2005',
    category: 'administrative',
    type: 'Act',
    summary: 'Provides citizens right to information about governance and public bodies.',
    fullText: 'The RTI Act empowers citizens to seek information from public authorities, promoting transparency and accountability.',
    citations: 892,
    recentCases: 45,
    bookmarked: false,
    lastUpdated: '2026-03-01',
    provisions: ['30 days for response', 'Appeals process', 'Penalties for non-compliance'],
    references: ['Section 4', 'Section 6', 'Section 19'],
  },
  {
    id: 4,
    title: 'Environmental Protection Act, 1986',
    category: 'environmental',
    type: 'Act',
    summary: 'Legislation protecting environment and natural resources from pollution and degradation.',
    fullText: 'This Act protects environment from pollution and provides for prevention and control of environmental deterioration.',
    citations: 567,
    recentCases: 89,
    bookmarked: false,
    lastUpdated: '2026-02-10',
    provisions: ['Prevention of pollution', 'Biodiversity protection', 'Waste management'],
    references: ['Section 15', 'Section 25', 'Schedule'],
  },
  {
    id: 5,
    title: 'Labour Code on Wages, 2020',
    category: 'labor',
    type: 'Act',
    summary: 'Regulates payment of wages and provides minimum wage guarantees.',
    citations: 456,
    recentCases: 67,
    bookmarked: false,
    lastUpdated: '2026-03-10',
    provisions: ['Minimum wage', 'Payment frequency', 'Deductions'], 
    references: ['Chapter II', 'Chapter IV'],
  },
];

const complianceChecklist = [
  { id: 1, title: 'Timely Complaint Registration', completed: true, dueDate: '2026-03-31' },
  { id: 2, title: 'RTI Application Processing (30 days)', completed: false, dueDate: '2026-04-15' },
  { id: 3, title: 'Evidence Documentation', completed: true, dueDate: '2026-03-28' },
  { id: 4, title: 'Complainant Communication', completed: true, dueDate: '2026-03-20' },
  { id: 5, title: 'Department Coordination', completed: false, dueDate: '2026-04-10' },
];

const departmentCompliance = [
  { dept: 'Police Department', score: 92, status: 'Excellent' },
  { dept: 'Municipal Services', score: 78, status: 'Good' },
  { dept: 'Revenue Department', score: 85, status: 'Good' },
  { dept: 'Health Department', score: 88, status: 'Good' },
  { dept: 'Education Department', score: 95, status: 'Excellent' },
  { dept: 'Public Works', score: 72, status: 'Fair' },
];

const auditLogs = [
  { id: 1, action: 'Compliance Check Run', date: '2026-03-29 10:30 AM', status: 'Completed', user: 'Admin' },
  { id: 2, action: 'Policy Updated', date: '2026-03-28 02:15 PM', status: 'Completed', user: 'Policy Team' },
  { id: 3, action: 'Audit Initiated', date: '2026-03-27 09:00 AM', status: 'Completed', user: 'Compliance Officer' },
  { id: 4, action: 'Non-compliance Alert', date: '2026-03-26 04:45 PM', status: 'Reviewed', user: 'System' },
];

export default function LegalResearchEnhanced() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState(sampleLegalData);
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'criminal', label: 'Criminal Law' },
    { value: 'civil', label: 'Civil Law' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'labor', label: 'Labor Law' },
    { value: 'consumer', label: 'Consumer Rights' },
    { value: 'administrative', label: 'Administrative' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      let filtered = sampleLegalData;
      if (query) {
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.summary.toLowerCase().includes(query.toLowerCase())
        );
      }
      if (category) {
        filtered = filtered.filter(item => item.category === category);
      }
      setResults(filtered);
      setLoading(false);
    }, 400);
  };

  const toggleBookmark = (item) => {
    const isBookmarked = bookmarks.some(b => b.id === item.id);
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(b => b.id !== item.id));
    } else {
      setBookmarks([...bookmarks, item]);
    }
  };

  const isBookmarked = (item) => bookmarks.some(b => b.id === item.id);

  return (
    <div className="bg-slate-50 text-on-surface min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-primary">Legal Research</h1>
              <p className="text-sm text-slate-600 mt-1">Search acts, precedents, and legal provisions</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
              <span className="material-symbols-outlined text-primary">law</span>
              <span className="text-sm font-semibold text-primary">{results.length} Results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Search Query</label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., consumer protection..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-container text-white py-3 px-4 rounded-lg font-bold transition-all duration-200 active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">search</span>
                  <span>Search Legal DB</span>
                </button>
              </form>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Statistics</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Acts & Laws</span>
                    <span className="text-sm font-bold text-primary">1,245</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Precedents</span>
                    <span className="text-sm font-bold text-secondary">3,892</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Your Bookmarks</span>
                    <span className="text-sm font-bold text-tertiary">{bookmarks.length}</span>
                  </div>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Compliance Items</p>
                <div className="mt-3 space-y-2">
                  {complianceChecklist.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '18px', fontVariationSettings: item.completed ? "'FILL' 1" : "" }}>
                        check_circle
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-700">{item.title}</p>
                        <p className="text-xs text-slate-500">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
              {['search', 'bookmarks', 'compliance', 'recent'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'search' && '🔍 Search Results'}
                  {tab === 'bookmarks' && `📌 Bookmarks (${bookmarks.length})`}
                  {tab === 'compliance' && '✅ Compliance'}
                  {tab === 'recent' && '📅 Recent'}
                </button>
              ))}
            </div>

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-4">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-4xl text-primary/20 animate-spin mb-3 block">hourglass_empty</span>
                      <p className="text-slate-600">Searching legal database...</p>
                    </div>
                  </div>
                )}
                {!loading && results.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">search_off</span>
                    <p className="text-slate-600">No legal documents found.</p>
                  </div>
                )}
                {!loading && results.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDetailView(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">{item.type === 'Act' ? 'description' : 'gavel'}</span>
                            {item.type}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-on-surface hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-sm text-slate-600 mt-2">{item.summary}</p>
                        <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">quote</span>
                            {item.citations} citations
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">gavel</span>
                            {item.recentCases} cases
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(item);
                        }}
                        className={`flex-shrink-0 p-3 rounded-lg transition-all duration-200 ${
                          isBookmarked(item)
                            ? 'bg-primary/10 text-primary'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: isBookmarked(item) ? "'FILL' 1" : "" }}>
                          bookmark
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-4">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">bookmark_outline</span>
                    <p className="text-slate-600">No bookmarked items yet.</p>
                  </div>
                ) : (
                  bookmarks.map((item) => (
                    <div key={item.id} className="bg-white border border-primary/20 bg-primary/5 rounded-xl p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-on-surface">{item.title}</h3>
                          <p className="text-sm text-slate-600 mt-2">{item.summary}</p>
                        </div>
                        <button
                          onClick={() => toggleBookmark(item)}
                          className="flex-shrink-0 p-3 rounded-lg bg-primary/10 text-primary"
                        >
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Department Compliance Scorecard</h3>
                  <div className="space-y-3">
                    {departmentCompliance.map((dept) => (
                      <div key={dept.dept} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{dept.dept}</p>
                          <p className="text-xs text-slate-600">{dept.status}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary/50" style={{ width: `${dept.score}%` }}></div>
                          </div>
                          <span className="text-sm font-bold text-primary">{dept.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Tab */}
            {activeTab === 'recent' && (
              <div className="space-y-4">
                {sampleLegalData.slice(0, 3).map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-secondary font-bold uppercase">Updated {item.lastUpdated}</p>
                        <h3 className="text-lg font-bold text-on-surface mt-1">{item.title}</h3>
                        <p className="text-sm text-slate-600 mt-2">{item.summary}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailView && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-on-surface">{selectedItem.title}</h2>
              <button onClick={() => setShowDetailView(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase mb-2">Type</p>
                <p className="text-on-surface">{selectedItem.type}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase mb-2">Summary</p>
                <p className="text-on-surface">{selectedItem.fullText}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase mb-3">Key Provisions</p>
                <div className="space-y-2">
                  {selectedItem.provisions.map((prov, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                      <span className="text-on-surface">{prov}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase mb-2">References</p>
                <p className="text-on-surface">{selectedItem.references.join(', ')}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleBookmark(selectedItem)}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isBookmarked(selectedItem)
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined">bookmark</span>
                  {isBookmarked(selectedItem) ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button className="flex-1 bg-primary hover:bg-primary-container text-white py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">download</span>
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

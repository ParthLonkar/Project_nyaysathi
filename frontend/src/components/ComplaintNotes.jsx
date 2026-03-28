import React, { useState, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../utils/api.js';

export default function ComplaintNotes({ complaintId, userType }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [complaintId]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem(`${userType}Token`);
      const response = await fetch(`${API_BASE_URL}/search/complaints/${complaintId}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        const { notes: data } = await response.json();
        setNotes(data || []);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    setError('');

    if (!newNote.trim()) {
      setError('Note cannot be empty');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem(`${userType}Token`);
      const response = await fetch(`${API_BASE_URL}/search/complaints/${complaintId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ content: newNote })
      });

      if (response.ok) {
        const { note } = await response.json();
        setNotes([note, ...notes]);
        setNewNote('');
        fetchNotes();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add note');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Internal Notes & Comments
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="mb-6">
        <div className="flex gap-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note or comment..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows="3"
          />
          <button
            type="submit"
            disabled={loading || !newNote.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center gap-2 h-fit"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-600">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {note.user_type === 'admin' ? '👤 Admin' : '👥 Staff'}
                  </p>
                  <p className="text-sm text-gray-600">{formatDate(note.created_at)}</p>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

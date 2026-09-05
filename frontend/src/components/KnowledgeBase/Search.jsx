import { useState } from 'react';
import { searchKnowledge, addDocument } from '../../api/knowledge';
import ResultCard from './ResultCard';
import { searchKnowledge as search } from '../../api/knowledge';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collection, setCollection] = useState('docs');
  const [topK, setTopK] = useState(5);
  const [addMode, setAddMode] = useState(false);
  const [newDoc, setNewDoc] = useState({ id: '', text: '', title: '' });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await search(query, collection, topK);
      setResults(data);
    } catch (err) {
      setError(err.error || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.id || !newDoc.text) return;
    setLoading(true);
    setError(null);
    try {
      await addDocument(newDoc.id, newDoc.text, { title: newDoc.title }, collection);
      setNewDoc({ id: '', text: '', title: '' });
    } catch (err) {
      setError(err.error || err.message || 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Knowledge Base</h1>
        <button
          onClick={() => setAddMode(!addMode)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
        >
          {addMode ? 'Search Mode' : '+ Add Document'}
        </button>
      </div>

      {addMode ? (
        <form onSubmit={handleAddDocument} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Document ID</label>
              <input
                value={newDoc.id}
                onChange={(e) => setNewDoc({ ...newDoc, id: e.target.value })}
                placeholder="unique-id"
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
              <input
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                placeholder="Document title"
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Content</label>
            <textarea
              value={newDoc.text}
              onChange={(e) => setNewDoc({ ...newDoc, text: e.target.value })}
              rows={6}
              placeholder="Document content..."
              className="w-full p-2 border border-slate-300 rounded-md text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newDoc.id || !newDoc.text}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Adding...' : 'Add to Knowledge Base'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <div className="flex gap-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your knowledge base..."
              className="flex-1 p-2.5 border border-slate-300 rounded-md text-sm"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-2.5 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Collection</label>
              <input
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-slate-500 mb-1">Top K Results</label>
              <input
                type="number"
                min="1"
                max="20"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value) || 5)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
          </div>
        </form>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-700">
            Results ({results.length})
          </h2>
          {results.map((result, idx) => (
            <ResultCard key={idx} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}

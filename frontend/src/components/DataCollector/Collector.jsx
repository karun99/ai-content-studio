import { useState } from 'react';
import { runCollector } from '../../api/collector';
import PlatformSelector from './PlatformSelector';

const defaultPlatforms = [
  { id: 'twitter', label: 'Twitter/X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'github', label: 'GitHub' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'web', label: 'Web' },
];

export default function Collector() {
  const [urls, setUrls] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [options, setOptions] = useState({ depth: 2, format: 'json' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCollect = async (e) => {
    e.preventDefault();
    const urlList = urls.split('\n').map((u) => u.trim()).filter(Boolean);
    if (!urlList.length && !selectedPlatforms.length) return;

    setLoading(true);
    setError(null);
    try {
      const data = await runCollector(urlList, selectedPlatforms, options);
      setResults(data);
    } catch (err) {
      setError(err.error || err.message || 'Collection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToKnowledge = (content, title) => {
    // Store in session to pass to knowledge base
    const pendingDocs = JSON.parse(sessionStorage.getItem('pending_docs') || '[]');
    pendingDocs.push({ id: `collected-${Date.now()}`, text: content, title });
    sessionStorage.setItem('pending_docs', JSON.stringify(pendingDocs));
    alert('Added to pending. Go to Knowledge Base to save.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Data Collector</h1>
        <p className="text-sm text-slate-500 mt-1">
          Collect content from URLs and platforms using Agent Reach
        </p>
      </div>

      <form onSubmit={handleCollect} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            URLs (one per line)
          </label>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={4}
            placeholder={'https://example.com/article\nhttps://example.com/blog'}
            className="w-full p-2.5 border border-slate-300 rounded-md text-sm resize-none"
          />
        </div>

        <PlatformSelector
          platforms={defaultPlatforms}
          selected={selectedPlatforms}
          onChange={setSelectedPlatforms}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Depth</label>
            <input
              type="number"
              min="1"
              max="10"
              value={options.depth}
              onChange={(e) => setOptions({ ...options, depth: parseInt(e.target.value) || 2 })}
              className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Format</label>
            <select
              value={options.format}
              onChange={(e) => setOptions({ ...options, format: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="text">Text</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (!urls.trim() && !selectedPlatforms.length)}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? 'Collecting...' : 'Start Collection'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-700">Collected Content</h2>
          {results.map((result, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-800 truncate">
                  {result.url || result.platform || result.source || `Source ${idx + 1}`}
                </div>
                {result.error ? (
                  <span className="text-red-500 text-xs">Error</span>
                ) : (
                  <button
                    onClick={() => handleAddToKnowledge(JSON.stringify(result), `Collected ${idx + 1}`)}
                    className="px-3 py-1 text-xs bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors"
                  >
                    Save to KB
                  </button>
                )}
              </div>
              {result.error ? (
                <p className="mt-2 text-sm text-red-500">{result.error}</p>
              ) : (
                <pre className="mt-3 p-3 bg-slate-50 rounded-md text-xs text-slate-600 overflow-x-auto max-h-40 overflow-y-auto">
                  {JSON.stringify(result, null, 2).slice(0, 2000)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useCallback } from 'react';
import { uploadFile } from '../../api/parser';
import DropZone from './DropZone';

const supportedFormats = [
  { ext: '.pdf', desc: 'PDF documents' },
  { ext: '.html', desc: 'HTML pages' },
  { ext: '.epub', desc: 'EPUB e-books' },
  { ext: '.docx', desc: 'Word documents' },
  { ext: '.pptx', desc: 'PowerPoint presentations' },
  { ext: '.md', desc: 'Markdown files' },
  { ext: '.json', desc: 'JSON data' },
];

export default function Parser() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
    setError(null);
  }, []);

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await uploadFile(file);
      setResult(data);
    } catch (err) {
      setError(err.error || err.message || 'Parsing failed');
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = file ? `file.${file.name.split('.').pop()}` : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">File Parser</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload any document and convert it to content
        </p>
      </div>

      <DropZone onFile={handleFile} file={file} supportedFormats={supportedFormats} />

      {file && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm uppercase">
                {file.name.split('.').pop()}
              </span>
            </div>
            <div>
              <div className="font-medium text-sm text-slate-700">{file.name}</div>
              <div className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB • {formatLabel}
              </div>
            </div>
          </div>
          <button
            onClick={handleParse}
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Parsing...' : 'Parse File'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">Parsed Content</h2>
            <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-md">
              {result.format} format
            </span>
          </div>

          {result.text && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Text Preview</h3>
              <div className="p-4 bg-slate-50 rounded-md text-sm text-slate-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {result.text.slice(0, 3000)}
                {result.text.length > 3000 && (
                  <span className="text-slate-400">... (truncated)</span>
                )}
              </div>
            </div>
          )}

          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Metadata</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.metadata).map(([key, value]) => (
                  <div key={key} className="p-2 bg-slate-50 rounded-md text-sm">
                    <span className="text-slate-500">{key}: </span>
                    <span className="text-slate-700">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

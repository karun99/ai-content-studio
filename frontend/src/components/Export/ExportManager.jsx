import { useState } from 'react';
import { exportDocument } from '../../api/export';
import FormatSelector from './FormatSelector';
import { getContent, listDocuments } from '../../api/editor';

const formats = [
  { value: 'pdf', label: 'PDF', icon: '📄', desc: 'Print-ready document' },
  { value: 'html', label: 'HTML', icon: '🌐', desc: 'Web page' },
  { value: 'epub', label: 'EPUB', icon: '📚', desc: 'E-book format' },
  { value: 'docx', label: 'DOCX', icon: '📝', desc: 'Word document' },
  { value: 'pptx', label: 'PPTX', icon: '📊', desc: 'PowerPoint slides' },
  { value: 'markdown', label: 'Markdown', icon: '✍️', desc: 'Plain text markup' },
  { value: 'json', label: 'JSON', icon: '⚙️', desc: 'Structured data' },
];

export default function ExportManager() {
  const [format, setFormat] = useState('pdf');
  const [documentId, setDocumentId] = useState('');
  const [title, setTitle] = useState('My Document');
  const [author, setAuthor] = useState('AI Content Studio');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showDocs, setShowDocs] = useState(false);

  const loadDocuments = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
      setShowDocs(!showDocs);
    } catch (err) {
      setError(err.error || err.message || 'Failed to load documents');
    }
  };

  const loadDocument = async (id) => {
    try {
      const doc = await getContent(id);
      setDocumentId(id);
      setContent(JSON.stringify(doc.content));
      setShowDocs(false);
    } catch (err) {
      setError(err.error || err.message || 'Failed to load document');
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const realContent = content || getHtmlContent();
      await exportDocument(documentId || 'untitled', format, realContent, { title, author });
      setSuccess(`Export to ${format.toUpperCase()} initiated. Check your downloads.`);
    } catch (err) {
      setError(err.error || err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const getHtmlContent = () => {
    return `<h1>${title}</h1><p>This is content from the AI Content Studio.</p>`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Export Manager</h1>
          <p className="text-sm text-slate-500 mt-1">
            Export content to any format
          </p>
        </div>
        <button
          onClick={loadDocuments}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          {showDocs ? 'Hide Documents' : 'Load Documents'}
        </button>
      </div>

      {showDocs && documents.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Available Documents</h3>
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => loadDocument(doc.id)}
              className="w-full p-3 text-left bg-slate-50 rounded-md hover:bg-slate-100 transition-colors"
            >
              <div className="font-medium text-sm text-slate-700">{doc.id}</div>
              <div className="text-xs text-slate-500">
                Updated: {new Date(doc.updatedAt).toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
        <FormatSelector
          formats={formats}
          selected={format}
          onChange={setFormat}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Document ID</label>
            <input
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="document-id"
              className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Author</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Content (HTML)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="<h1>Title</h1><p>Your content here...</p>"
            className="w-full p-2.5 border border-slate-300 rounded-md text-sm font-mono resize-none"
          />
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Exporting...' : `Export as ${formats.find((f) => f.value === format).label}`}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
          {success}
        </div>
      )}
    </div>
  );
}

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useEffect } from 'react';
import Toolbar from './Toolbar';
import AIActions from '../AIActions/AIActions';
import { saveContent } from '../../api/editor';

export default function Editor() {
  const [documentId] = useState(() => {
    return new URLSearchParams(window.location.search).get('doc') || `doc-${Date.now()}`;
  });
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your content here...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none',
      },
    },
  });

  const handleSave = async () => {
    if (!editor) return;
    try {
      await saveContent(documentId, editor.getJSON());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save document');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, documentId]);

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Document Editor</h1>
          <p className="text-sm text-slate-500">Document ID: {documentId}</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
        >
          {saved ? '✓ Saved' : 'Save (Ctrl+S)'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Toolbar editor={editor} />
          <EditorContent editor={editor} className="bg-white rounded-b-lg shadow-sm" />
        </div>
        <div className="lg:col-span-1">
          <AIActions editor={editor} />
        </div>
      </div>
    </div>
  );
}

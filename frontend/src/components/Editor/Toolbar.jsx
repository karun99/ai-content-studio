const tools = {
  bold: { icon: 'B', label: 'Bold' },
  italic: { icon: 'I', label: 'Italic' },
  strike: { icon: 'S', label: 'Strikethrough' },
  code: { icon: '<>', label: 'Inline Code' },
  codeBlock: { icon: '{ }', label: 'Code Block' },
  blockquote: { icon: '"', label: 'Quote' },
  bulletList: { icon: '•', label: 'Bullet List' },
  orderedList: { icon: '1.', label: 'Numbered List' },
  heading1: { icon: 'H1', label: 'Heading 1' },
  heading2: { icon: 'H2', label: 'Heading 2' },
  heading3: { icon: 'H3', label: 'Heading 3' },
  horizontalRule: { icon: '—', label: 'Divider' },
  undo: { icon: '↩', label: 'Undo' },
  redo: { icon: '↪', label: 'Redo' },
};

export default function Toolbar({ editor }) {
  if (!editor) return null;

  const active = {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    strike: editor.isActive('strike'),
    code: editor.isActive('code'),
    codeBlock: editor.isActive('codeBlock'),
    blockquote: editor.isActive('blockquote'),
    bulletList: editor.isActive('bulletList'),
    orderedList: editor.isActive('orderedList'),
    heading1: editor.isActive('heading', { level: 1 }),
    heading2: editor.isActive('heading', { level: 2 }),
    heading3: editor.isActive('heading', { level: 3 }),
  };

  const actions = {
    bold: () => editor.chain().focus().toggleBold().run(),
    italic: () => editor.chain().focus().toggleItalic().run(),
    strike: () => editor.chain().focus().toggleStrike().run(),
    code: () => editor.chain().focus().toggleCode().run(),
    codeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
    blockquote: () => editor.chain().focus().toggleBlockquote().run(),
    bulletList: () => editor.chain().focus().toggleBulletList().run(),
    orderedList: () => editor.chain().focus().toggleOrderedList().run(),
    heading1: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    heading2: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    heading3: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    horizontalRule: () => editor.chain().focus().setHorizontalRule().run(),
    undo: () => editor.chain().focus().undo().run(),
    redo: () => editor.chain().focus().redo().run(),
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-white border border-b-0 border-slate-200 rounded-t-lg">
      {Object.entries(tools).map(([name, tool]) => (
        <button
          key={name}
          onClick={() => actions[name]()}
          title={tool.label}
          className={`px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${
            active[name]
              ? 'bg-primary-100 text-primary-600'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}

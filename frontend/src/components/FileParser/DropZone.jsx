import { useState, useCallback, useRef } from 'react';

export default function DropZone({ onFile, file, supportedFormats = [] }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onFile(files[0]);
    }
  }, [onFile]);

  const handleSelect = useCallback((e) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFile(files[0]);
    }
  }, [onFile]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
        dragging
          ? 'border-primary-400 bg-primary-50'
          : 'border-slate-300 hover:border-primary-300 hover:bg-slate-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleSelect}
        accept={supportedFormats.map((f) => f.ext).join(',')}
      />
      <div className="flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dragging ? 'bg-primary-100' : 'bg-slate-100'}`}>
          <svg
            className={`w-6 h-6 ${dragging ? 'text-primary-500' : 'text-slate-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 13a3 3 0 11-2.83 3.99M15 13l-3-3m0 0l-3 3m3-3v10"
            />
          </svg>
        </div>
        <p className="font-medium text-slate-600">
          {file ? file.name : 'Drag & drop your file here'}
        </p>
        <p className="text-sm text-slate-500">
          or click to browse
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center mt-2">
          {supportedFormats.map((format) => (
            <span
              key={format.ext}
              className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded"
              title={format.desc}
            >
              {format.ext}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

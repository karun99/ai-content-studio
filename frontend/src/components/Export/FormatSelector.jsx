export default function FormatSelector({ formats, selected, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-3">
        Output Format
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {formats.map((format) => (
          <button
            key={format.value}
            onClick={() => onChange(format.value)}
            className={`p-4 rounded-lg border text-left transition-all ${
              selected === format.value
                ? 'bg-primary-50 border-primary-400 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-2xl mb-2">{format.icon}</div>
            <div className="font-medium text-sm text-slate-700">{format.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{format.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

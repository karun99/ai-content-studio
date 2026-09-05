export default function PlatformSelector({ platforms, selected, onChange }) {
  const toggle = (id) => {
    onChange(
      selected.includes(id)
        ? selected.filter((p) => p !== id)
        : [...selected, id]
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-2">
        Platforms to collect from
      </label>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            type="button"
            key={platform.id}
            onClick={() => toggle(platform.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
              selected.includes(platform.id)
                ? 'bg-primary-50 border-primary-300 text-primary-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {platform.label}
          </button>
        ))}
      </div>
    </div>
  );
}

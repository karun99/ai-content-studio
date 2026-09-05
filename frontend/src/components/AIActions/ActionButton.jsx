export default function ActionButton({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
        selected
          ? 'bg-primary-50 border-primary-300 text-primary-600'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

export default function ResultCard({ result }) {
  const relevance = result.distance !== undefined ? (1 - result.distance).toFixed(3) : null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">
            {result.metadata?.title || result.id}
          </h3>
          <p className="mt-2 text-sm text-slate-600 line-clamp-3">
            {result.document}
          </p>
        </div>
        {relevance && (
          <span className="flex-shrink-0 px-2 py-1 bg-green-50 text-green-600 text-xs rounded-md">
            {(parseFloat(relevance) * 100).toFixed(0)}% match
          </span>
        )}
      </div>
      {result.metadata && Object.keys(result.metadata).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(result.metadata).map(([key, value]) => (
            <span
              key={key}
              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
            >
              {key}: {String(value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

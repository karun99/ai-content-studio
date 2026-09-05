import { useState } from 'react';

export default function CompareView({ results }) {
  const [selectedEngine, setSelectedEngine] = useState(null);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(results).map(([engine, result]) => (
          <button
            key={engine}
            onClick={() => setSelectedEngine(engine === selectedEngine ? null : engine)}
            className={`p-2 rounded-md text-left transition-colors border ${
              engine === selectedEngine
                ? 'bg-primary-50 border-primary-300'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="font-medium text-sm text-slate-700 capitalize">{engine}</div>
            <div className="text-xs text-slate-500 truncate">
              {typeof result === 'string' ? result.slice(0, 100) : JSON.stringify(result).slice(0, 100)}
            </div>
          </button>
        ))}
      </div>

      {selectedEngine && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md max-h-60 overflow-y-auto">
          <h4 className="text-sm font-semibold text-slate-700 capitalize mb-2">
            {selectedEngine} Output
          </h4>
          <div className="text-sm text-slate-600 whitespace-pre-wrap">
            {typeof results[selectedEngine] === 'string'
              ? results[selectedEngine]
              : JSON.stringify(results[selectedEngine], null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}

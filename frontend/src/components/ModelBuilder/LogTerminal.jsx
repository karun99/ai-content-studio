export default function LogTerminal({ logs, onLogsChange, wsConnected }) {
  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 bg-red-400 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
            <span className="w-3 h-3 bg-green-400 rounded-full"></span>
          </div>
          <span className="ml-2 text-sm text-slate-300 font-mono">Conversion Terminal</span>
        </div>
        <div className="flex items-center gap-3">
          {wsConnected && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Live
            </span>
          )}
          <button
            onClick={() => onLogsChange([])}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="p-4 h-64 overflow-y-auto font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-slate-500">Waiting for conversion output...</div>
        ) : (
          <div className="space-y-1">
            {logs.map((line, idx) => (
              <div
                key={idx}
                className={`${
                  line.startsWith('Error')
                    ? 'text-red-400'
                    : line.includes('complete')
                    ? 'text-green-400'
                    : 'text-slate-300'
                } whitespace-pre-wrap`}
              >
                <span className="text-slate-500 mr-2">{String(idx + 1).padStart(3, '0')}</span>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

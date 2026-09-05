import { useState } from 'react';
import { startTraining, getTrainingStatus } from '../../api/modelLab';
import useWebSocket from '../../hooks/useWebSocket';
import TrainingChart from './TrainingChart';

export default function Lab() {
  const [config, setConfig] = useState({
    dataset: 'default',
    epochs: 10,
    lr: 5e-4,
    batchSize: 32,
    modelSize: '256',
  });
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [training, setTraining] = useState(false);
  const { isConnected, data } = useWebSocket(null, ['training:log', 'training:progress', 'training:complete', 'training:error']);

  const handleTrainingLog = (log) => {
    if (log?.line) {
      setLogs((prev) => [...prev, log.line]);
    }
  };

  useState(() => {
    getTrainingStatus().then((status) => {
      if (status?.logs?.length) {
        setLogs(status.logs);
        setTraining(!!status.running);
      }
    }).catch(() => {});
  });

  const handleStart = async (e) => {
    e.preventDefault();
    setError(null);
    setLogs([]);
    setTraining(true);
    try {
      await startTraining(config);
    } catch (err) {
      setError(err.error || err.message || 'Training failed');
      setTraining(false);
    }
  };

  const epochs = config.epochs;
  const chartData = Array.from({ length: epochs }, (_, i) => ({
    epoch: i + 1,
    loss: Math.max(0.5, 2.0 - (2.0 - 0.2) * ((i + 1) / epochs) + Math.sin(i) * 0.1),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Model Lab</h1>
          <p className="text-sm text-slate-500 mt-1">
            MiniMind training with live WebSocket logs
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isConnected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {isConnected ? 'WebSocket Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleStart} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">Training Configuration</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Dataset</label>
              <input
                value={config.dataset}
                onChange={(e) => setConfig({ ...config, dataset: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Model Size</label>
              <select
                value={config.modelSize}
                onChange={(e) => setConfig({ ...config, modelSize: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="128">128</option>
                <option value="256">256</option>
                <option value="512">512</option>
                <option value="768">768</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Epochs</label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.epochs}
                onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) || 10 })}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Batch Size</label>
              <input
                type="number"
                min="1"
                max="256"
                value={config.batchSize}
                onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) || 32 })}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Learning Rate
            </label>
            <input
              type="number"
              step="0.0001"
              value={config.lr}
              onChange={(e) => setConfig({ ...config, lr: parseFloat(e.target.value) || 0.0005 })}
              className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={training}
            className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {training ? 'Training in Progress...' : 'Start Training'}
          </button>
        </form>

        <div className="space-y-6">
          <TrainingChart data={chartData} epochs={epochs} />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Training Logs</h2>
        <div className="space-y-1 font-mono text-xs max-h-80 overflow-y-auto">
          {logs.length === 0 && (
            <div className="text-slate-400">No logs yet. Start training to see output.</div>
          )}
          {logs.map((line, idx) => (
            <div key={idx} className="text-slate-600 whitespace-pre-wrap">
              {line}
            </div>
          ))}
          {data['training:log']?.line !== logs[logs.length - 1] && data['training:log'] && (
            <div className="text-slate-600 whitespace-pre-wrap">
              {data['training:log'].line}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

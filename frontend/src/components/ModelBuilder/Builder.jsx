import { useState } from 'react';
import { convertModel, getConversionStatus } from '../../api/builder';
import useWebSocket from '../../hooks/useWebSocket';
import LogTerminal from './LogTerminal';

const formats = [
  { value: 'gguf', label: 'GGUF', desc: 'llama.cpp format' },
  { value: 'ggml', label: 'GGML', desc: 'Legacy ggml format' },
  { value: 'onnx', label: 'ONNX', desc: 'Open Neural Network Exchange' },
  { value: 'safetensors', label: 'SafeTensors', desc: 'Safe tensor format' },
];

const quantizationOptions = ['q2_k', 'q3_k', 'q4_0', 'q4_k', 'q5_0', 'q5_k', 'q6_k', 'q8_0'];

export default function Builder() {
  const [modelPath, setModelPath] = useState('');
  const [outputFormat, setOutputFormat] = useState('gguf');
  const [quantization, setQuantization] = useState('q4_0');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const { isConnected } = useWebSocket(null, ['builder:log', 'builder:complete', 'builder:error']);

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!modelPath || !outputFormat) return;
    setLoading(true);
    setError(null);
    setLogs([]);
    setResult(null);
    try {
      const res = await convertModel(modelPath, outputFormat, quantization);
      setJobId(res.jobId);
      setResult(res);
    } catch (err) {
      setError(err.error || err.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Model Builder</h1>
        <p className="text-sm text-slate-500 mt-1">
          Convert and quantize AI models
        </p>
      </div>

      <form onSubmit={handleConvert} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Model Path
          </label>
          <input
            value={modelPath}
            onChange={(e) => setModelPath(e.target.value)}
            placeholder="/path/to/huggingface/model"
            className="w-full p-2.5 border border-slate-300 rounded-md text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Output Format
            </label>
            <div className="space-y-2">
              {formats.map((format) => (
                <label
                  key={format.value}
                  className={`flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors ${
                    outputFormat === format.value
                      ? 'bg-primary-50 border-primary-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={outputFormat === format.value}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="hidden"
                  />
                  <div>
                    <div className="font-medium text-sm text-slate-700">{format.label}</div>
                    <div className="text-xs text-slate-500">{format.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {outputFormat === 'gguf' && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Quantization
                </label>
                <select
                  value={quantization}
                  onChange={(e) => setQuantization(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm"
                >
                  {quantizationOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Lower quantization = smaller file, higher speed, lower quality.
                  q4_0 and q4_k are good default choices.
                </p>
              </div>
            )}

            {outputFormat !== 'gguf' && (
              <div className="p-4 bg-slate-50 rounded-md text-sm text-slate-600">
                {formats.find((f) => f.value === outputFormat)?.desc} conversion requires
                the appropriate Python tools (e.g., optimum-cli for ONNX).
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !modelPath}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Converting...' : 'Start Conversion'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-700">Conversion Complete</div>
            <div className="text-sm text-slate-500">
              Job ID: {result.jobId} • Output: {result.outputPath}
            </div>
          </div>
          <button
            onClick={() => getConversionStatus(result.jobId).then((s) => alert(JSON.stringify(s, null, 2)))}
            className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
          >
            View Status
          </button>
        </div>
      )}

      <LogTerminal logs={logs} onLogsChange={setLogs} wsConnected={isConnected} />
    </div>
  );
}

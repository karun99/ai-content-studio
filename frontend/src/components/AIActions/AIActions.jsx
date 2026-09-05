import { useState } from 'react';
import { runAI, compareAI } from '../../api/ai';
import ActionButton from './ActionButton';
import CompareView from './CompareView';

const engines = [
  { value: 'ollama', label: 'Ollama' },
  { value: 'llamacpp', label: 'llama.cpp' },
  { value: 'hf', label: 'Hugging Face' },
  { value: 'nvidia', label: 'NVIDIA NIM' },
  { value: 'openrouter', label: 'OpenRouter' },
];

const actions = [
  { value: 'generate', label: '✍️ Generate', prompt: 'Generate content about:' },
  { value: 'summarize', label: '📝 Summarize', prompt: 'Summarize the following:' },
  { value: 'rewrite', label: '🔄 Rewrite', prompt: 'Rewrite the following:' },
  { value: 'translate', label: '🌐 Translate', prompt: 'Translate the following:' },
];

const defaultModels = {
  ollama: 'llama3.2',
  llamacpp: 'default',
  hf: 'microsoft/phi-2',
  nvidia: 'meta/llama3-8b',
  openrouter: 'openai/gpt-3.5-turbo',
};

export default function AIActions({ editor }) {
  const [engine, setEngine] = useState('ollama');
  const [model, setModel] = useState(defaultModels.ollama);
  const [action, setAction] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareEngines, setCompareEngines] = useState(['ollama', 'openrouter']);
  const [compareResults, setCompareResults] = useState(null);
  const [error, setError] = useState(null);

  const handleEngineChange = (e) => {
    const val = e.target.value;
    setEngine(val);
    setModel(defaultModels[val] || '');
  };

  const handleAction = async (presetPrompt) => {
    const selectedText = editor?.state?.selection?.empty
      ? editor?.getText() || ''
      : editor?.state?.doc?.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          ' '
        ) || '';

    const fullPrompt = `${presetPrompt || prompt}\n\nText: ${selectedText}`;
    setLoading(true);
    setError(null);
    setCompareResults(null);

    try {
      if (compareMode) {
        const models = compareEngines.map((eng) => defaultModels[eng]);
        const results = await compareAI(fullPrompt, compareEngines, models);
        setCompareResults(results);
      } else {
        const response = await runAI(fullPrompt, engine, model);
        editor?.chain().focus().insertContent('\n\n' + response).run();
      }
    } catch (err) {
      setError(err.error || err.message || 'AI request failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompareEngine = (eng) => {
    setCompareEngines((prev) =>
      prev.includes(eng) ? prev.filter((e) => e !== eng) : [...prev, eng]
    );
  };

  const currentAction = actions.find((a) => a.value === action);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">AI Actions</h2>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={compareMode}
            onChange={() => setCompareMode(!compareMode)}
            className="rounded border-slate-300"
          />
          Compare
        </label>
      </div>

      {!compareMode ? (
        <>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Engine</label>
              <select
                value={engine}
                onChange={handleEngineChange}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
              >
                {engines.map((eng) => (
                  <option key={eng.value} value={eng.value}>{eng.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Model</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model name"
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {actions.map((a) => (
              <ActionButton
                key={a.value}
                label={a.label}
                selected={action === a.value}
                onClick={() => setAction(a.value)}
              />
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              {currentAction?.prompt}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Enter your prompt..."
              className="w-full p-2 border border-slate-300 rounded-md text-sm resize-none"
            />
          </div>

          <button
            onClick={() => handleAction()}
            disabled={loading || !prompt}
            className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Running...' : 'Execute'}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Select Engines</label>
            {engines.map((eng) => (
              <label key={eng.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={compareEngines.includes(eng.value)}
                  onChange={() => toggleCompareEngine(eng.value)}
                  className="rounded border-slate-300"
                />
                {eng.label}
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Enter your prompt..."
              className="w-full p-2 border border-slate-300 rounded-md text-sm resize-none"
            />
          </div>

          <button
            onClick={() => handleAction()}
            disabled={loading || !prompt || compareEngines.length < 2}
            className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Comparing...' : 'Compare Engines'}
          </button>

          {compareResults && <CompareView results={compareResults} />}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

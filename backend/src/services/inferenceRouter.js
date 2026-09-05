const axios = require('axios');
const {
  OLLAMA_URL,
  LLAMACPP_URL,
  HF_SERVICE_URL,
  NVIDIA_NIM_ENDPOINT,
  OPENROUTER_API_KEY,
  NVIDIA_API_KEY,
} = process.env;

const engineConfig = {
  ollama: {
    url: `${OLLAMA_URL}/api/generate`,
    buildPayload: (model, prompt, options = {}) => ({
      model,
      prompt,
      stream: false,
      ...options,
    }),
    extract: (data) => data.response,
  },
  llamacpp: {
    url: `${LLAMACPP_URL}/completion`,
    buildPayload: (model, prompt, options = {}) => ({
      prompt,
      n_predict: options.max_tokens || 256,
      temperature: options.temperature || 0.7,
      ...options,
    }),
    extract: (data) => data.content,
  },
  hf: {
    url: `${HF_SERVICE_URL}/generate`,
    buildPayload: (model, prompt, options = {}) => ({
      model,
      prompt,
      ...options,
    }),
    extract: (data) => data.text,
  },
  nvidia: {
    url: `${NVIDIA_NIM_ENDPOINT}/chat/completions`,
    buildPayload: (model, prompt, options = {}) => ({
      model,
      messages: [{ role: 'user', content: prompt }],
      ...options,
    }),
    headers: { Authorization: `Bearer ${NVIDIA_API_KEY}` },
    extract: (data) => data.choices[0].message.content,
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    buildPayload: (model, prompt, options = {}) => ({
      model: model || 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      ...options,
    }),
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}` },
    extract: (data) => data.choices[0].message.content,
  },
};

async function route(prompt, engine, model, options = {}) {
  const cfg = engineConfig[engine];
  if (!cfg) throw new Error(`Unknown engine: ${engine}`);

  const payload = cfg.buildPayload(model, prompt, options);
  const headers = {
    'Content-Type': 'application/json',
    ...(cfg.headers || {}),
  };

  const response = await axios.post(cfg.url, payload, {
    headers,
    timeout: 120000,
  });

  return cfg.extract(response.data);
}

async function compare(prompt, engines, models = [], options = {}) {
  const results = {};
  const promises = engines.map(async (engine, idx) => {
    try {
      const model = models[idx] || 'default';
      results[engine] = await route(prompt, engine, model, options);
    } catch (err) {
      results[engine] = `Error: ${err.message}`;
    }
  });
  await Promise.all(promises);
  return results;
}

module.exports = { route, compare, engineConfig };

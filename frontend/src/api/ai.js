import apiClient from './client';

export const runAI = (prompt, engine, model, options = {}) =>
  apiClient.post('/api/ai/run', { prompt, engine, model, options })
    .then((res) => res.data.response);

export const compareAI = (prompt, engines, models = [], options = {}) =>
  apiClient.post('/api/ai/compare', { prompt, engines, models, options })
    .then((res) => res.data.results);

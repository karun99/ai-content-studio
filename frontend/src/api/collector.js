import apiClient from './client';

export const runCollector = (urls = [], platforms = [], options = {}) =>
  apiClient.post('/api/collector/scrape', { urls, platforms, options })
    .then((res) => res.data.results);

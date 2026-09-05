import apiClient from './client';

export const addDocument = (id, text, metadata = {}, collection = 'docs') =>
  apiClient.post('/api/knowledge/add', { id, text, metadata, collection });

export const searchKnowledge = (query, collection = 'docs', topK = 5) =>
  apiClient.get('/api/knowledge/search', {
    params: { q: query, collection, topK },
  }).then((res) => res.data.results);

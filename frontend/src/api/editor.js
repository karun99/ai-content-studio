import apiClient from './client';

export const saveContent = (id, content) =>
  apiClient.post('/api/editor/save', { id, content });

export const getContent = (id) =>
  apiClient.get(`/api/editor/load/${id}`).then((res) => res.data);

export const listDocuments = () =>
  apiClient.get('/api/editor/list').then((res) => res.data.documents);

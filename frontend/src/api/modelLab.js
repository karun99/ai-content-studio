import apiClient from './client';

export const startTraining = (config) =>
  apiClient.post('/api/modellab/start', { config }).then((res) => res.data);

export const getTrainingStatus = () =>
  apiClient.get('/api/modellab/status').then((res) => res.data.status);

import apiClient from './client';

export const convertModel = (modelPath, outputFormat, quantization = 'q4_0') =>
  apiClient.post('/api/builder/convert', { modelPath, outputFormat, quantization })
    .then((res) => res.data);

export const getConversionStatus = (jobId) =>
  apiClient.get(`/api/builder/status/${jobId}`).then((res) => res.data.status);

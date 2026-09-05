import apiClient from './client';

export const exportDocument = (id, format, content, metadata = {}) =>
  apiClient.post(`/api/export/${format}`, { documentId: id, content, metadata }, {
    responseType: 'blob',
  }).then((res) => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${metadata.title || 'document'}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  });

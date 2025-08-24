// API configuration utility
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_BASE_URL.replace('/api', '');

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

export { API_BASE_URL, BASE_URL };

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('promptflow_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token if unauthenticated
      localStorage.removeItem('promptflow_token');
    }
    return Promise.reject(error);
  }
);

export default api;

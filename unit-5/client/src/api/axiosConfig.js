import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export { API_BASE };

// Request Interceptor: Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expensesync-jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle session expiration (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized. Clearing stored token.');
      localStorage.removeItem('expensesync-jwt');
    }
    return Promise.reject(error);
  }
);

export default api;


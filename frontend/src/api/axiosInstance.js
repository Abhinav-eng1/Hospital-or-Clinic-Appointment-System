// frontend/src/api/axiosInstance.js
// Central Axios instance with automated Authorization header injection via interceptor

import axios from 'axios';

// Determine base API URL:
// 1. If VITE_API_URL environment variable is provided, use it (ensuring it ends with /api)
// 2. If running in production (e.g. deployed on Vercel), default to the Render backend URL
// 3. In local development without env variable, use '/api' to leverage Vite's local dev proxy
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }
  if (import.meta.env.PROD) {
    return 'https://hospital-or-clinic-appointment-system.onrender.com/api';
  }
  return '/api';
};

// Create a pre-configured Axios client
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Before any HTTP request is dispatched, check if a JWT token is stored in localStorage.
 * If found, automatically attach it as a Bearer token in the 'Authorization' header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * If the server responds with 401 Unauthorized (e.g. token expired),
 * clear local storage and redirect user to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking /api/auth/me during initial boot
      const isAuthCheck = error.config && error.config.url.includes('/auth/me');
      if (!isAuthCheck) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

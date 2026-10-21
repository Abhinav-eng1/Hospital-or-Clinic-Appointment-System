// frontend/src/api/axiosInstance.js
// Central Axios instance with automated Authorization header injection via interceptor

import axios from 'axios';

// Create a pre-configured Axios client
const api = axios.create({
  baseURL: '/api',
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

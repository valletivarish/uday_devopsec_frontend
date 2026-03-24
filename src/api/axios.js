/**
 * Axios instance configured with the base URL and JWT auth interceptor.
 *
 * In development, the Vite dev server proxies /api requests to the backend
 * at localhost:5000, so a relative base URL is used. In production, the
 * VITE_API_URL environment variable points to the EC2 backend directly.
 *
 * Author: Uday Kiran Reddy Dodda (x25166484)
 */
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('opm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('opm_user');
      localStorage.removeItem('opm_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

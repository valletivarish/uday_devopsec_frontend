/**
 * Axios instance configured with the base URL for all API calls.
 *
 * In development, the Vite dev server proxies /api requests to the backend
 * at localhost:5000, so a relative base URL is used. In production, the
 * VITE_API_URL environment variable points to the EC2 backend directly.
 *
 * Author: Uday Kiran Reddy Dodda (x25166484)
 */
import axios from 'axios';

// Use the environment variable if set (production S3 deployment),
// otherwise fall back to /api for local dev proxy
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;

import axios from 'axios';

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (typeof window !== 'undefined' ? 'http://localhost:3001/api' : 'http://dacn_backend_dev:3001/api'),
  withCredentials: true,
});

// Attach Authorization header and normalize URLs
http.interceptors.request.use(
  function attachAuth(config) {
    try {
      const base = String(http.defaults.baseURL || '').replace(/\/+$/, '');
      if (typeof config.url === 'string' && base.endsWith('/api')) {
        if (config.url === '/api') {
          config.url = '/';
        } else if (config.url.startsWith('/api/')) {
          config.url = config.url.slice(4);
        }
      }
      var token = window.localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + token;
      }
    } catch (_) {}
    return config;
  },
  function onReqError(error) {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default http;
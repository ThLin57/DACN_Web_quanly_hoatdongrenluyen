import axios from 'axios';

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
});

// Attach Authorization header if token exists
http.interceptors.request.use(
  function attachAuth(config) {
    try {
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
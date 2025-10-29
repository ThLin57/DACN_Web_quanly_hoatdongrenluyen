import axios from 'axios';
import sessionStorageManager from './sessionStorageManager';

// Compute a safe default baseURL that works in production behind Nginx
function computeBaseURL() {
  // Helper to parse query string safely
  const getQueryParam = (name) => {
    try {
      const url = new URL(window.location.href);
      return url.searchParams.get(name);
    } catch (_) {
      return null;
    }
  };

  // Browser-only runtime overrides
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    
    // FORCE LOCALHOST IN DEVELOPMENT - Clear any cached IP
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      try {
        const saved = window.localStorage.getItem('API_BASE_URL');
        if (saved && !saved.includes('localhost') && !saved.includes('127.0.0.1')) {
          console.log('[HTTP] FORCE CLEARING cached IP:', saved, '-> localhost');
          window.localStorage.removeItem('API_BASE_URL');
        }
      } catch (_) {}
      
      // Always return localhost for localhost access
      return 'http://localhost:3001/api';
    }

    // 1) URL query override: ?api=http://IP:3001/api
    const apiFromQuery = getQueryParam('api');
    // Special value to reset override: ?api=auto or ?api=reset
    if (apiFromQuery && /^(auto|reset)$/i.test(apiFromQuery)) {
      try { window.localStorage.removeItem('API_BASE_URL'); } catch (_) {}
      // fall through to normal computation below
    } else if (apiFromQuery && /^https?:\/\//i.test(apiFromQuery)) {
      try {
        window.localStorage.setItem('API_BASE_URL', apiFromQuery.replace(/\/$/, ''));
      } catch (_) {}
      return apiFromQuery.replace(/\/$/, '');
    }

    // 2) LocalStorage override (sticky) - but prefer localhost in development
    try {
      const saved = window.localStorage.getItem('API_BASE_URL');
      if (saved && /^https?:\/\//i.test(saved)) {
        return saved.replace(/\/$/, '');
      }
    } catch (_) {}
  }

  // 3) Build-time env (fallback after runtime overrides)
  if (process.env.REACT_APP_API_URL) return String(process.env.REACT_APP_API_URL).replace(/\/$/, '');

  // 4) Derive from current origin
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol } = window.location;

    // For development, always try localhost first
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3001/api';
    }

    // On LAN IPs, assume backend at same host, port 3001
    return `${protocol}//${hostname}:3001/api`;
  }

  // 5) Fallback inside Docker network
  return 'http://dacn_backend_dev:3001/api';
}

const initialBaseURL = computeBaseURL();
const http = axios.create({
  baseURL: initialBaseURL,
  withCredentials: false, // false for Docker; cookies not used currently
  timeout: 8000, // prevent UI hanging on dead endpoints
});

// Log once so we can see where the frontend is calling
try {
  // eslint-disable-next-line no-console
  console.log('[HTTP] BaseURL =', http.defaults.baseURL);
} catch (_) {}

// Expose helpers to manage baseURL at runtime from browser console
try {
  // eslint-disable-next-line no-undef
  window.setApiBase = function setApiBase(url) {
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      console.warn('Usage: setApiBase("http://IP:3001/api")');
      return;
    }
    const clean = url.replace(/\/$/, '');
    try { window.localStorage.setItem('API_BASE_URL', clean); } catch (_) {}
    http.defaults.baseURL = clean;
    console.log('[HTTP] BaseURL overridden ->', clean);
  };
  
  // eslint-disable-next-line no-undef
  window.resetApiBase = function resetApiBase() {
    try { 
      window.localStorage.removeItem('API_BASE_URL'); 
      console.log('[HTTP] API_BASE_URL cleared from localStorage');
    } catch (_) {}
    // Reload page to reinitialize
    window.location.reload();
  };
  
  // eslint-disable-next-line no-undef
  window.getApiBase = function getApiBase() {
    console.log('[HTTP] Current BaseURL:', http.defaults.baseURL);
    console.log('[HTTP] Stored BaseURL:', window.localStorage.getItem('API_BASE_URL'));
  };
} catch (_) {}

// Attach Authorization header, TabId, and normalize URLs
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
      
      // Get token from tab-scoped session storage
      var token = sessionStorageManager.getToken();
      // Get tabId
      var tabId = sessionStorageManager.getTabId();
      
      // Only log TabId info for debugging, not as error
      if (process.env.NODE_ENV === 'development') {
        console.log('HTTP Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing', 'TabId:', tabId || 'Not set');
      }
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + token;
      }
      
      // Attach tabId to header for multi-tab session awareness
      if (tabId) {
        config.headers = config.headers || {};
        config.headers['X-Tab-Id'] = tabId;
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
    // Normalize common network errors for better UX
    try {
      if (error?.code === 'ECONNABORTED') {
        error.message = 'Kết nối API quá thời gian (timeout). Vui lòng kiểm tra địa chỉ API và mạng.';
      } else if (error?.message && /Network\s?Error/i.test(error.message)) {
        error.message = 'Không thể kết nối API (Network Error). Vui lòng kiểm tra địa chỉ API và mạng.';
      }
    } catch (_) {}
    return Promise.reject(error);
  }
);

export default http;
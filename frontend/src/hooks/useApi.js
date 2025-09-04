import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Custom hook để xử lý API calls với loading và error states
 * @param {Function} apiFunction - Function gọi API
 * @returns {Object} { data, loading, error, execute }
 */
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      
      // Tự động logout nếu token hết hạn
      if (err.response?.status === 401) {
        logout();
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, logout]);

  return {
    data,
    loading,
    error,
    execute,
    reset: () => {
      setData(null);
      setError(null);
    }
  };
};

export default useApi;

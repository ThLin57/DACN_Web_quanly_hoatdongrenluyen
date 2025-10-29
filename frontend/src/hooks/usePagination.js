import { useState, useCallback } from 'react';

/**
 * Custom hook for managing pagination state
 * @param {Object} initialParams - Initial pagination parameters
 * @returns {Object} Pagination state and handlers
 */
export function usePagination(initialParams = {}) {
  const [pagination, setPagination] = useState({
    page: initialParams.page || 1,
    limit: initialParams.limit || 20,
    search: initialParams.search || '',
    ...initialParams
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Update pagination parameters
  const updatePagination = useCallback((newParams) => {
    setPagination(prev => ({
      ...prev,
      ...newParams,
      // Reset to page 1 when changing search or filters
      page: newParams.search !== undefined || newParams.limit !== undefined ? 1 : (newParams.page || prev.page)
    }));
  }, []);

  // Go to specific page
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Go to next page
  const nextPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  // Go to previous page
  const prevPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  // Change page size
  const changePageSize = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Update search
  const updateSearch = useCallback((search) => {
    setPagination(prev => ({ ...prev, search, page: 1 }));
  }, []);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setPagination({
      page: 1,
      limit: initialParams.limit || 20,
      search: '',
      ...initialParams
    });
  }, [initialParams]);

  // Build query parameters for API calls
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return params.toString();
  }, [pagination]);

  return {
    // State
    pagination,
    loading,
    data,
    error,
    
    // Actions
    updatePagination,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    updateSearch,
    resetPagination,
    buildQueryParams,
    
    // Setters
    setLoading,
    setData,
    setError
  };
}

/**
 * Hook for managing table data with pagination
 * @param {Function} fetchFunction - Function to fetch data
 * @param {Object} initialParams - Initial parameters
 * @returns {Object} Table state and handlers
 */
export function usePaginatedTable(fetchFunction, initialParams = {}) {
  const paginationHook = usePagination(initialParams);
  const { pagination, loading, data, error, setLoading, setData, setError } = paginationHook;

  // Fetch data with current pagination parameters
  const fetchData = useCallback(async (additionalParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = paginationHook.buildQueryParams();
      const response = await fetchFunction(queryParams, additionalParams);
      
      setData(response);
      return response;
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, paginationHook.buildQueryParams, setLoading, setData, setError]);

  // Refresh current data
  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    paginationHook.goToPage(page);
    // Auto-fetch new data when page changes
    setTimeout(() => fetchData(), 0);
  }, [paginationHook.goToPage, fetchData]);

  // Handle search
  const handleSearch = useCallback((search) => {
    paginationHook.updateSearch(search);
    // Auto-fetch new data when search changes
    setTimeout(() => fetchData(), 0);
  }, [paginationHook.updateSearch, fetchData]);

  // Handle page size change
  const handlePageSizeChange = useCallback((limit) => {
    paginationHook.changePageSize(limit);
    // Auto-fetch new data when page size changes
    setTimeout(() => fetchData(), 0);
  }, [paginationHook.changePageSize, fetchData]);

  return {
    ...paginationHook,
    fetchData,
    refresh,
    handlePageChange,
    handleSearch,
    handlePageSizeChange
  };
}

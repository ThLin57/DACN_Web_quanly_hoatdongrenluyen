/**
 * Pagination utility functions for admin endpoints
 */

/**
 * Create standardized pagination response
 * @param {Object} params - Pagination parameters
 * @param {number} params.page - Current page number
 * @param {number} params.limit - Items per page
 * @param {number} params.total - Total number of items
 * @param {number} params.maxLimit - Maximum allowed limit
 * @returns {Object} Standardized pagination object
 */
function createPaginationResponse({ page, limit, total, maxLimit = 100 }) {
  const actualLimit = Math.min(parseInt(limit), maxLimit);
  const currentPage = parseInt(page);
  const totalPages = Math.ceil(total / actualLimit);
  
  return {
    page: currentPage,
    limit: actualLimit,
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null
  };
}

/**
 * Validate and sanitize pagination parameters
 * @param {Object} query - Query parameters from request
 * @param {Object} options - Validation options
 * @returns {Object} Sanitized pagination parameters
 */
function validatePaginationParams(query, options = {}) {
  const {
    defaultPage = 1,
    defaultLimit = 20,
    maxLimit = 100,
    minLimit = 1
  } = options;
  
  const page = Math.max(parseInt(query.page) || defaultPage, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit) || defaultLimit, minLimit),
    maxLimit
  );
  
  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

/**
 * Create paginated database query options
 * @param {Object} paginationParams - Pagination parameters
 * @param {Object} orderBy - Order by options
 * @returns {Object} Database query options
 */
function createQueryOptions(paginationParams, orderBy = { ngay_tao: 'desc' }) {
  return {
    skip: paginationParams.offset,
    take: paginationParams.limit,
    orderBy
  };
}

module.exports = {
  createPaginationResponse,
  validatePaginationParams,
  createQueryOptions
};

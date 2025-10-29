const { sanitizeInput } = require('../utils/validation');

// Sanitize toàn cục body, query, params để giảm nguy cơ XSS đơn giản
module.exports = function sanitizeMiddleware(req, res, next) {
  try {
    if (req.body) req.body = sanitizeInput(req.body);
    if (req.query) req.query = sanitizeInput(req.query);
    if (req.params) req.params = sanitizeInput(req.params);
  } catch (_) {
    // bỏ qua nếu có lỗi không mong muốn khi sanitize
  }
  next();
};



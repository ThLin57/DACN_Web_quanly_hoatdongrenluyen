const cors = require('cors');

// CORS configuration đơn giản cho development
const corsOptions = {
  origin: true, // Cho phép tất cả origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204
};

module.exports = cors(corsOptions);
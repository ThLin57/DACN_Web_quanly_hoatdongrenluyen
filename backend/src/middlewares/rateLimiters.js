const rateLimit = require('express-rate-limit');

// Giới hạn đăng nhập theo IP và (nếu có) theo username
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userKey = (req.body && (req.body.maso || req.body.username || req.body.email)) || 'anon';
    return `${req.ip}:${userKey}`;
  },
  message: {
    success: false,
    message: 'Thử đăng nhập quá nhiều lần, vui lòng thử lại sau ít phút'
  }
});

module.exports = { loginLimiter };



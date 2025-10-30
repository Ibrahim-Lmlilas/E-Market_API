const rateLimit = require('express-rate-limit');

const apiLimiter = (minutes, max) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    max: max,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
module.exports = apiLimiter;

// 120 000ms / 1000 = 120s / 60 = 2min
//x minutes*60secondes*1000ms

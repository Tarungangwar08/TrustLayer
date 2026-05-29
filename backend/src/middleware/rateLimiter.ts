import rateLimit from 'express-rate-limit';

export const verifyRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many verification requests. Try again in 1 minute.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

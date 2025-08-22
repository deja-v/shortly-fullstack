import rateLimit from 'express-rate-limit';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Rate limiter for general API endpoints
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for URL shortening (more restrictive for anonymous users)
export const urlShortenRateLimit = (req, res, next) => {
  // Different limits for authenticated vs anonymous users
  const limit = req.user ? 50 : 10; // 50 for auth users, 10 for anonymous
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  const limiter = rateLimit({
    windowMs,
    max: limit,
    message: {
      success: false,
      message: `Too many URL shortening requests. Limit: ${limit} per 15 minutes`,
      suggestion: req.user ? null : 'Login to get higher limits'
    },
    keyGenerator: (req) => {
      return req.user ? `user:${req.user._id}` : `ip:${req.ip}`;
    }
  });
  
  return limiter(req, res, next);
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};
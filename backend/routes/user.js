import express from 'express';
import { 
  handleUserRegister, 
  handleUserLogin, 
  handleUserLogout,
  handleTokenRefresh 
} from '../controllers/user.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { handleValidationErrors, loginValidation, registerValidation } from '../middlewares/validations.js';

const router = express.Router();

router.post('/register', 
  registerValidation,
  handleValidationErrors,
  handleUserRegister
);

router.post('/login',
  loginValidation,
  handleValidationErrors,
  handleUserLogin
);

router.post('/refresh-token', handleTokenRefresh);

router.post('/logout', authenticateToken, handleUserLogout);

router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
        lastLoginAt: req.user.lastLoginAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

export default router;

// // app.js - Main application setup
// import express from 'express';
// import mongoose from 'mongoose';
// import cookieParser from 'cookie-parser';
// import dotenv from 'dotenv';

// // Import middleware
// import { generalRateLimit } from './middleware/rateLimiter.js';
// import { errorHandler } from './middleware/errorHandler.js';
// import { securityConfig } from './middleware/security.js';

// // Import routes
// import authRoutes from './routes/auth.routes.js';
// import urlRoutes from './routes/url.routes.js'; // Your existing URL routes

// dotenv.config();

// const app = express();

// // Security middleware
// app.use(securityConfig.helmet);
// app.use(securityConfig.cors);

// // Basic middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Rate limiting
// app.use(generalRateLimit);

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api', urlRoutes);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ 
//     success: true, 
//     message: 'Server is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // Error handling middleware (must be last)
// app.use(errorHandler);

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shortly';

// mongoose.connect(MONGO_URI)
//   .then(() => {
//     console.log('Connected to MongoDB');
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   });
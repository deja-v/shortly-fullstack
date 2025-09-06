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
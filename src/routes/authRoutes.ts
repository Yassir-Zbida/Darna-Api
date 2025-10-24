import { Router } from 'express';

import { body } from 'express-validator';
import AuthController from '../controllers/authController';
import { userValidator } from '../validators/userValidator';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const authController = new AuthController();


// Route d'inscription
router.post('/register', 
    userValidator.getValidationRules(),
    authController.register
);

// login
router.post('/login', AuthController.login);

// Refresh access token
router.post('/refresh-token', AuthController.refreshToken);

// logout (requires authentication)
router.post('/logout', authenticateToken, AuthController.logout);

// Get current user profile (requires authentication)
router.get('/me', authenticateToken, AuthController.getProfile);

// Validate access token
router.get('/validate', AuthController.validateToken);

// Get active refresh tokens (requires authentication)
router.get('/refresh-tokens', authenticateToken, AuthController.getRefreshTokens);

// Revoke all refresh tokens (requires authentication)
router.post('/revoke-all-tokens', authenticateToken, AuthController.revokeAllTokens);

// Email verification routes
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);

export default router;

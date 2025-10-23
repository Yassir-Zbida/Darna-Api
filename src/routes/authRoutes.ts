import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { body } from 'express-validator';
import { userValidator } from '../validators/userValidator';

const router = Router();
const authController = new AuthController();

/**
 * Authentication Routes
 * All routes are prefixed with /api/auth
 */

// Inscription
router.post('/register', 
    userValidator.getValidationRules(),
    authController.register
);

// login
router.post('/login', AuthController.login);

// Refresh access token
router.post('/refresh-token', AuthController.refreshToken);

// logout
router.post('/logout', AuthController.logout);

// Get current user profile
router.get('/me', AuthController.getProfile);

// Validate access token
router.get('/validate', AuthController.validateToken);

// Get active refresh tokens
router.get('/refresh-tokens', AuthController.getRefreshTokens);

// Revoke all refresh tokens
router.post('/revoke-all-tokens', AuthController.revokeAllTokens);

export default router;
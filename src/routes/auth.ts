import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

/**
 * Authentication Routes
 * All routes are prefixed with /api/auth
 */

// POST /api/auth/login - User login
router.post('/login', AuthController.login);

// POST /api/auth/refresh-token - Refresh access token
router.post('/refresh-token', AuthController.refreshToken);

// POST /api/auth/logout - User logout
router.post('/logout', AuthController.logout);

// GET /api/auth/me - Get current user profile
router.get('/me', AuthController.getProfile);

// GET /api/auth/validate - Validate access token
router.get('/validate', AuthController.validateToken);

// GET /api/auth/refresh-tokens - Get active refresh tokens
router.get('/refresh-tokens', AuthController.getRefreshTokens);

// POST /api/auth/revoke-all-tokens - Revoke all refresh tokens
router.post('/revoke-all-tokens', AuthController.revokeAllTokens);

export default router;

import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginCredentials, RefreshTokenData } from '../types/auth';
import logger from '../utils/logger';

export class AuthController {
    /**
     * User login endpoint
     * POST /api/auth/login
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password }: LoginCredentials = req.body;

            // Validate required fields
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email et mot de passe sont requis'
                });
                return;
            }

            // Validate email format
            if (!AuthService.isValidEmail(email)) {
                res.status(400).json({
                    success: false,
                    message: 'Format d\'email invalide'
                });
                return;
            }

            // Attempt login
            const result = await AuthService.login({ email, password });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }

        } catch (error) {
            logger.error('Erreur dans le contrôleur de connexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Refresh access token endpoint
     * POST /api/auth/refresh
     */
    static async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken }: RefreshTokenData = req.body;

            // Validate required fields
            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token est requis'
                });
                return;
            }

            // Attempt token refresh
            const result = await AuthService.refreshAccessToken({ refreshToken });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }

        } catch (error) {
            logger.error('Erreur dans le contrôleur de refresh token:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * User logout endpoint
     * POST /api/auth/logout
     */
    static async logout(req: Request, res: Response): Promise<void> {
        try {
            // Get user ID from token (if middleware is implemented)
            const userId = (req as any).user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Token d\'authentification requis'
                });
                return;
            }

            // Attempt logout
            const result = await AuthService.logout(userId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }

        } catch (error) {
            logger.error('Erreur dans le contrôleur de déconnexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Get current user profile
     * GET /api/auth/me
     */
    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            // Get user ID from token (if middleware is implemented)
            const userId = (req as any).user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Token d\'authentification requis'
                });
                return;
            }

            // Get user profile
            const user = await AuthService.getUserById(userId);

            if (user) {
                res.status(200).json({
                    success: true,
                    message: 'Profil utilisateur récupéré',
                    user
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Utilisateur introuvable'
                });
            }

        } catch (error) {
            logger.error('Erreur dans le contrôleur de profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Validate token endpoint
     * GET /api/auth/validate
     */
    static async validateToken(req: Request, res: Response): Promise<void> {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    message: 'Token d\'authentification manquant'
                });
                return;
            }

            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            const payload = AuthService.verifyAccessToken(token);

            if (payload) {
                res.status(200).json({
                    success: true,
                    message: 'Token valide',
                    user: {
                        userId: payload.userId,
                        email: payload.email,
                        role: payload.role
                    }
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Token invalide ou expiré'
                });
            }

        } catch (error) {
            logger.error('Erreur dans le contrôleur de validation de token:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}

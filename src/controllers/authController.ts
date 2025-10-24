import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginCredentials, RefreshTokenData, DeviceInfo, RegisterData } from '../types/auth';
import { AuthErrorType, createErrorResponse } from '../types/errors';
import logger from '../utils/logger';

export class AuthController {
  
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name, phone, role } = req.body;
            const userData: RegisterData = { email, password, name, phone, role };
            const authResponse = await AuthService.register(userData);
            res.status(authResponse.success ? 201 : 400).json(authResponse);
        } catch (error) {
            logger.error('Erreur dans le contrôleur register:', error);
            res.status(500).json({
                success: false,
                message: "Erreur interne du serveur"
            });
        }
    }
  
    /**
     * User login endpoint
     * POST /api/auth/login
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password }: LoginCredentials = req.body;

            // Validate required fields
            if (!email || !password) {
                const errorResponse = createErrorResponse(AuthErrorType.REQUIRED_FIELDS_MISSING, {
                    missingFields: [
                        !email ? 'email' : null,
                        !password ? 'password' : null
                    ].filter(Boolean)
                });
                res.status(errorResponse.error.statusCode).json(errorResponse);
                return;
            }

            // Validate email format
            if (!AuthService.isValidEmail(email)) {
                const errorResponse = createErrorResponse(AuthErrorType.EMAIL_INVALID, { email });
                res.status(errorResponse.error.statusCode).json(errorResponse);
                return;
            }

            // Attempt login
            const result = await AuthService.login({ email, password });

            if (result.success) {
                res.status(200).json(result);
            } else {
                // Determine appropriate status code based on error type
                let statusCode = 401; // Default to unauthorized
                
                // Map specific error messages to status codes
                if (result.message.includes('désactivé')) {
                    statusCode = 403; // Forbidden
                } else if (result.message.includes('verrouillé')) {
                    statusCode = 423; // Locked
                } else if (result.message.includes('Format d\'email')) {
                    statusCode = 400; // Bad Request
                } else if (result.message.includes('champs requis')) {
                    statusCode = 400; // Bad Request
                }
                
                res.status(statusCode).json(result);
            }

        } catch (error) {
            logger.error('Erreur dans le contrôleur de connexion:', error);
            const errorResponse = createErrorResponse(AuthErrorType.INTERNAL_ERROR, {
                originalError: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(errorResponse.error.statusCode).json(errorResponse);
        }
    }

    /**
     * Refresh access token endpoint
     * POST /api/auth/refresh-token
     */
    static async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken }: RefreshTokenData = req.body;

            // Validate required fields
            if (!refreshToken) {
                const errorResponse = createErrorResponse(AuthErrorType.TOKEN_MISSING, {
                    tokenType: 'refresh'
                });
                res.status(errorResponse.error.statusCode).json(errorResponse);
                return;
            }

            // Get device information for security
            const deviceInfo: DeviceInfo = {};
            if (req.headers['user-agent']) {
                deviceInfo.userAgent = req.headers['user-agent'];
            }
            const ipAddress = req.ip || req.connection.remoteAddress;
            if (ipAddress) {
                deviceInfo.ipAddress = ipAddress;
            }

            // Attempt token refresh with device info
            const result = await AuthService.refreshAccessToken({ refreshToken }, deviceInfo);

            if (result.success) {
                res.status(200).json(result);
            } else {
                // Determine appropriate status code based on error type
                let statusCode = 401; // Default to unauthorized
                
                // Map specific error messages to status codes
                if (result.message.includes('introuvable')) {
                    statusCode = 404; // Not Found
                } else if (result.message.includes('inactif')) {
                    statusCode = 403; // Forbidden
                } else if (result.message.includes('expiré')) {
                    statusCode = 401; // Unauthorized
                } else if (result.message.includes('révoqué')) {
                    statusCode = 401; // Unauthorized
                }
                
                res.status(statusCode).json(result);
            }

        } catch (error) {
            logger.error('Erreur dans le contrôleur de refresh token:', error);
            const errorResponse = createErrorResponse(AuthErrorType.INTERNAL_ERROR, {
                originalError: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(errorResponse.error.statusCode).json(errorResponse);
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

    /**
     * Get active refresh tokens for current user
     * GET /api/auth/refresh-tokens
     */
    static async getRefreshTokens(req: Request, res: Response): Promise<void> {
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

            // Get active refresh tokens
            const activeTokens = await AuthService.getActiveRefreshTokens(userId);

            res.status(200).json({
                success: true,
                message: 'Tokens de rafraîchissement récupérés',
                tokens: activeTokens.map(token => ({
                    createdAt: token.createdAt,
                    expiresAt: token.expiresAt,
                    deviceInfo: token.deviceInfo
                }))
            });

        } catch (error) {
            logger.error('Erreur dans le contrôleur de récupération des tokens:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Revoke all refresh tokens for current user
     * POST /api/auth/revoke-all-tokens
     */
    static async revokeAllTokens(req: Request, res: Response): Promise<void> {
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

            // Get user and revoke all tokens
            const user = await AuthService.getUserById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'Utilisateur introuvable'
                });
                return;
            }

            await AuthService.revokeAllRefreshTokens(user);

            res.status(200).json({
                success: true,
                message: 'Tous les tokens de rafraîchissement ont été révoqués'
            });

        } catch (error) {
            logger.error('Erreur dans le contrôleur de révocation des tokens:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}




export default AuthController;


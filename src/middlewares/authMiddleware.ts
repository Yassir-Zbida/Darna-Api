import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService';
import { JwtPayLoad } from '../types/auth';
import logger from '../utils/logger';

// Extend the Request interface to include user property
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
                tokenType: 'access' | 'refresh';
            };
        }
    }
}

/**
 * Authentication middleware to verify JWT access tokens
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Token d\'authentification requis'
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token d\'authentification requis'
            });
            return;
        }

        // Verify the token using AuthService
        const payload = AuthService.verifyAccessToken(token);
        
        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Token d\'authentification invalide ou expiré'
            });
            return;
        }

        // Check if token type is 'access'
        if (payload.tokenType !== 'access') {
            res.status(401).json({
                success: false,
                message: 'Type de token invalide'
            });
            return;
        }

        // Add user information to request object
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            tokenType: payload.tokenType
        };

        next();
    } catch (error) {
        logger.error('Erreur dans le middleware d\'authentification:', error);
        res.status(401).json({
            success: false,
            message: 'Token d\'authentification invalide'
        });
    }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            if (token) {
                const payload = AuthService.verifyAccessToken(token);
                
                if (payload && payload.tokenType === 'access') {
                    req.user = {
                        userId: payload.userId,
                        email: payload.email,
                        role: payload.role,
                        tokenType: payload.tokenType
                    };
                }
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        logger.warn('Token optionnel invalide:', error);
        next();
    }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Accès refusé - Rôle insuffisant'
            });
            return;
        }

        next();
    };
};

export default {
    authenticateToken,
    optionalAuth,
    requireRole
};

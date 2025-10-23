import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest, AuthOptions } from '../types/auth';
import logger from '../utils/logger';

/**
 * Middleware d'authentification unifié
 * Vérifie l'authentification, les rôles, les abonnements et la propriété des ressources
 */
export const auth = (options: AuthOptions = {}) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier le token JWT
            const token = getTokenFromRequest(req);
            
            if (!token) {
                if (options.optional) {
                    // Authentification optionnelle - continuer sans utilisateur
                    next();
                    return;
                }
                return sendError(res, 401, 'Token d\'authentification requis');
            }

            // 2. Vérifier la validité du token
            const payload = AuthService.verifyAccessToken(token);
            if (!payload || payload.tokenType !== 'access') {
                return sendError(res, 401, 'Token invalide ou expiré');
            }

            // 3. Récupérer l'utilisateur complet
            const user = await AuthService.getUserById(payload.userId);
            if (!user) {
                return sendError(res, 404, 'Utilisateur introuvable');
            }

            if (!user.isActive) {
                return sendError(res, 403, 'Compte inactif');
            }

            // Vérifier les rôles
            if (options.roles && !options.roles.includes(user.role)) {
                logger.warn(`Accès refusé - rôle insuffisant`, {
                    userId: (user as any)._id,
                    userRole: user.role,
                    requiredRoles: options.roles
                });
                return sendError(res, 403, 'Rôle insuffisant');
            }

            // Vérifier l'abonnement
            if (options.subscription) {
                const subscriptionLevels = { 'gratuit': 0, 'pro': 1, 'premium': 2 };
                const userLevel = subscriptionLevels[user.subscriptionType || 'gratuit'];
                const requiredLevel = subscriptionLevels[options.subscription];
                
                if (userLevel < requiredLevel) {
                    return sendError(res, 403, 'Abonnement insuffisant');
                }
            }

            // Vérifier la propriété de la ressource
            if (options.ownership) {
                const resourceId = (req as any).params[options.ownership];
                if (resourceId && (user as any)._id !== resourceId && user.role !== 'admin') {
                    return sendError(res, 403, 'Accès refusé - ressource non autorisée');
                }
            }

            // Ajouter l'utilisateur à la requête
            (req as any).user = user;

            logger.debug(`Authentification réussie`, {
                userId: (user as any)._id,
                email: user.email,
                role: user.role
            });

            next();

        } catch (error) {
            logger.error('Erreur dans le middleware d\'authentification:', error);
            sendError(res, 500, 'Erreur interne du serveur');
        }
    };
};

/**
 * Raccourcis pour les cas d'usage courants
 */
export const authRequired = () => auth({});
export const authOptional = () => auth({ optional: true });
export const adminOnly = () => auth({ roles: ['admin'] });
export const userOnly = () => auth({ roles: ['particulier', 'entreprise'] });
export const premiumOnly = () => auth({ subscription: 'premium' });

/**
 * Fonctions utilitaires pour l'authentification
 */
function getTokenFromRequest(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

function sendError(res: Response, status: number, message: string): void {
    res.status(status).json({
        success: false,
        error: {
            message,
            statusCode: status
        }
    });
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../types/auth';
import { ErrorType, createErrorResponse } from '../types/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware d'authentification
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      res.status(401).json(createErrorResponse(ErrorType.AUTH_ERROR, 'Token requis'));
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await UserModel.findById(payload.userId).select('-password');
    
    if (!user) {
      res.status(401).json(createErrorResponse(ErrorType.AUTH_ERROR, 'Utilisateur introuvable'));
      return;
    }

    // Assigner directement le UserDocument
    (req as AuthenticatedRequest).user = user;
    next();

  } catch (error) {
    res.status(401).json(createErrorResponse(ErrorType.AUTH_ERROR, 'Token invalide'));
  }
};

// Middleware pour admin seulement
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as AuthenticatedRequest).user;
  
  if (!user || user.role !== 'admin') {
    res.status(403).json(createErrorResponse(ErrorType.FORBIDDEN, 'Accès admin requis'));
    return;
  }
  
  next();
};

// Fonction utilitaire
function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
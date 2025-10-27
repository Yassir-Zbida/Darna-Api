import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest, AuthenticatedRequest } from '../types/auth';
import { ErrorType, createErrorResponse } from '../types/errors';

// Contrôleur d'authentification
export class AuthController {
  
  // Inscription
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        res.status(400).json(createErrorResponse(ErrorType.VALIDATION_ERROR, 'Email, mot de passe et nom requis'));
        return;
      }

      const result = await AuthService.register({ email, password, name });
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      res.status(500).json(createErrorResponse(ErrorType.SERVER_ERROR, 'Erreur serveur'));
    }
  }

  // Connexion
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json(createErrorResponse(ErrorType.VALIDATION_ERROR, 'Email et mot de passe requis'));
        return;
      }

      const result = await AuthService.login(email, password);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }

    } catch (error) {
      res.status(500).json(createErrorResponse(ErrorType.SERVER_ERROR, 'Erreur serveur'));
    }
  }

  // Profil utilisateur
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
        res.status(401).json(createErrorResponse(ErrorType.AUTH_ERROR, 'Non authentifié'));
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profil récupéré',
        user
      });

    } catch (error) {
      res.status(500).json(createErrorResponse(ErrorType.SERVER_ERROR, 'Erreur serveur'));
    }
  }
}
import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import { AuthService } from '../services/authService';
import { TwoFactorService } from '../services/twoFactorService';
import { UserModel } from '../models/User';
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
      const { email, password, twoFactorToken } = req.body;
      
      if (!email || !password) {
        res.status(400).json(createErrorResponse(ErrorType.VALIDATION_ERROR, 'Email et mot de passe requis'));
        return;
      }

      const result = await AuthService.login(email, password, twoFactorToken);
      
      if (result.success) {
        res.status(200).json(result);
      } else if (result.requires2FA) {
        res.status(200).json(result); // 200 car c'est une réponse valide demandant 2FA
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

  // Configuration 2FA
  static async setup2FA(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
        res.status(401).json(createErrorResponse(ErrorType.AUTH_ERROR, 'Non authentifié'));
        return;
      }

      const result = await TwoFactorService.setup2FA(user._id.toString());
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      res.status(500).json(createErrorResponse(ErrorType.SERVER_ERROR, 'Erreur serveur'));
    }
  }

  // Vérification et activation 2FA
  static async verify2FA(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { token } = req.body;
      
      if (!user) {
        res.status(401).json(createErrorResponse(ErrorType.AUTH_ERROR, 'Non authentifié'));
        return;
      }

      if (!token) {
        res.status(400).json(createErrorResponse(ErrorType.VALIDATION_ERROR, 'Code 2FA requis'));
        return;
      }

      const result = await TwoFactorService.verifyAndEnable2FA(user._id.toString(), token);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      res.status(500).json(createErrorResponse(ErrorType.SERVER_ERROR, 'Erreur serveur'));
    }
  }

  // Désactivation 2FA
  static async disable2FA(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
        res.status(401).json(createErrorResponse(ErrorType.AUTH_ERROR, 'Non authentifié'));
        return;
      }

      const result = await TwoFactorService.disable2FA(user._id.toString());
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      res.status(500).json(createErrorResponse(ErrorType.SERVER_ERROR, 'Erreur serveur'));
    }
  }

  // Vérification code de récupération 2FA
  static async verifyRecoveryCode(req: Request, res: Response): Promise<void> {
    try {
      const { email, recoveryCode } = req.body;
      
      if (!email || !recoveryCode) {
        res.status(400).json(createErrorResponse(ErrorType.VALIDATION_ERROR, 'Email et code de récupération requis'));
        return;
      }

      // Trouver l'utilisateur par email
      const user = await UserModel.findOne({ email });
      if (!user) {
        res.status(404).json(createErrorResponse(ErrorType.NOT_FOUND, 'Utilisateur non trouvé'));
        return;
      }

      const result = await TwoFactorService.verifyRecoveryCode(user._id.toString(), recoveryCode);
      
      if (result.success) {
        // Générer un token temporaire pour permettre la connexion
        const token = AuthService.generateToken(user._id.toString(), user.email, user.role);
        
        res.status(200).json({
          success: true,
          message: 'Code de récupération vérifié avec succès',
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            isVerified: user.isVerified,
            subscriptionType: user.subscriptionType,
            companyName: user.companyName,
            isKYCVerified: user.isKYCVerified,
            twoFactorEnabled: user.twoFactorEnabled,
            lastLogin: user.lastLogin,
            isActive: user.isActive,
            companyInfo: user.companyInfo
          }
        });
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      res.status(500).json(createErrorResponse(ErrorType.SERVER_ERROR, 'Erreur serveur'));
    }
  }

  // Debug endpoint pour tester 2FA
  static async debug2FA(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
        res.status(401).json(createErrorResponse(ErrorType.AUTH_ERROR, 'Non authentifié'));
        return;
      }

      const fullUser = await UserModel.findById(user._id);
      if (!fullUser) {
        res.status(404).json(createErrorResponse(ErrorType.NOT_FOUND, 'Utilisateur non trouvé'));
        return;
      }

      // Generate current valid token for testing
      let currentToken = '';
      if (fullUser.twoFactorSecret) {
        currentToken = speakeasy.totp({
          secret: fullUser.twoFactorSecret,
          encoding: 'base32',
          time: Math.floor(Date.now() / 1000)
        });
      }

      res.status(200).json({
        success: true,
        message: 'Debug 2FA info',
        user: {
          id: fullUser._id.toString(),
          email: fullUser.email,
          twoFactorEnabled: fullUser.twoFactorEnabled,
          hasSecret: !!fullUser.twoFactorSecret,
          secretLength: fullUser.twoFactorSecret?.length || 0
        },
        currentValidToken: currentToken,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json(createErrorResponse(ErrorType.SERVER_ERROR, 'Erreur serveur'));
    }
  }
}
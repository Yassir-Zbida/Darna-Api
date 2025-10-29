import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AuthRequest, AuthResponse, User, JwtPayload } from '../types/auth';
import { ErrorType, createErrorResponse } from '../types/errors';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = 12;

// Service d'authentification
export class AuthService {

  // Inscription
  static async register(userData: AuthRequest): Promise<AuthResponse> {
    try {
      const { email, password, name, role, phone } = userData;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return {
          success: false,
          message: 'Un utilisateur avec cet email existe déjà'
        };
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Créer l'utilisateur
      const user = new UserModel({
        email,
        password: hashedPassword,
        name,
        role: role || 'visiteur',
        phone: phone || undefined
      });

      await user.save();

      // Générer le token
      const token = this.generateToken(user._id.toString(), email, user.role);

      return {
        success: true,
        message: 'Utilisateur créé avec succès',
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
      };

    } catch (error: any) {
      logger.error('Erreur lors de la création du compte', { 
        error: error.message,
        stack: error.stack,
        email: userData.email 
      });
      return {
        success: false,
        message: 'Erreur lors de la création du compte'
      };
    }
  }

  // Connexion
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Trouver l'utilisateur
      const user = await UserModel.findOne({ email });
      if (!user) {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }

      // Vérifier si le compte est actif
      if (!user.isActive) {
        return {
          success: false,
          message: 'Compte désactivé'
        };
      }

      // Générer le token
      const token = this.generateToken(user._id.toString(), email, user.role);

      return {
        success: true,
        message: 'Connexion réussie',
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
      };

    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la connexion'
      };
    }
  }

  // Vérifier un token
  static async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const user = await UserModel.findById(payload.userId).select('-password');

      if (!user || !user.isActive) {
        return null;
      }

      return {
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
      };

    } catch (error) {
      return null;
    }
  }

  // Générer un token JWT
  private static generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { userId, email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}
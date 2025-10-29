import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { UserModel } from '../models/User';
import { ErrorType, createErrorResponse } from '../types/errors';

// Service pour l'authentification à deux facteurs
export class TwoFactorService {

  // Générer un secret 2FA et un QR code
  static async setup2FA(userId: string): Promise<{ success: boolean; message: string; secret?: string; qrCode?: string; manualEntryKey?: string }> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé'
        };
      }

      // Vérifier si 2FA est déjà activé
      if (user.twoFactorEnabled) {
        return {
          success: false,
          message: '2FA déjà activé pour cet utilisateur'
        };
      }

      // Générer un secret
      const secret = speakeasy.generateSecret({
        name: `Darna (${user.email})`,
        issuer: 'Darna',
        length: 32
      });

      // Sauvegarder le secret temporairement (pas encore activé)
      user.twoFactorSecret = secret.base32;
      await user.save();

      // Générer le QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      return {
        success: true,
        message: '2FA configuré avec succès',
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      };

    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la configuration 2FA'
      };
    }
  }

  // Vérifier un code 2FA et activer 2FA
  static async verifyAndEnable2FA(userId: string, token: string): Promise<{ success: boolean; message: string; recoveryCodes?: string[] }> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé'
        };
      }

      if (!user.twoFactorSecret) {
        return {
          success: false,
          message: '2FA non configuré. Veuillez d\'abord configurer 2FA'
        };
      }

      // Debug: Log the secret and token for debugging
      console.log('=== 2FA DEBUG ===');
      console.log('User ID:', userId);
      console.log('Stored Secret:', user.twoFactorSecret);
      console.log('Provided Token:', token);
      console.log('Token Type:', typeof token);
      console.log('Token Length:', token.length);

      // Generate current valid tokens for debugging
      const currentToken = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        time: Math.floor(Date.now() / 1000)
      });
      
      const previousToken = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        time: Math.floor(Date.now() / 1000) - 30
      });
      
      const nextToken = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        time: Math.floor(Date.now() / 1000) + 30
      });

      console.log('Current Valid Token:', currentToken);
      console.log('Previous Valid Token:', previousToken);
      console.log('Next Valid Token:', nextToken);
      console.log('==================');

      // Vérifier le code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2 // Tolérance de 2 périodes (60 secondes)
      });

      console.log('Verification Result:', verified);

      if (!verified) {
        return {
          success: false,
          message: 'Code 2FA invalide'
        };
      }

      // Générer les codes de récupération
      const recoveryCodes = this.generateRecoveryCodes();

      // Activer 2FA et sauvegarder les codes de récupération
      user.twoFactorEnabled = true;
      user.twoFactorRecoveryCodes = recoveryCodes;
      await user.save();

      return {
        success: true,
        message: '2FA activé avec succès',
        recoveryCodes: recoveryCodes
      };

    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la vérification 2FA'
      };
    }
  }

  // Vérifier un code 2FA (pour la connexion)
  static async verify2FA(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé'
        };
      }

      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return {
          success: false,
          message: '2FA non activé pour cet utilisateur'
        };
      }

      // Vérifier le code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2 // Tolérance de 2 périodes (60 secondes)
      });

      if (!verified) {
        return {
          success: false,
          message: 'Code 2FA invalide'
        };
      }

      return {
        success: true,
        message: 'Code 2FA vérifié avec succès'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la vérification 2FA'
      };
    }
  }

  // Désactiver 2FA
  static async disable2FA(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé'
        };
      }

      if (!user.twoFactorEnabled) {
        return {
          success: false,
          message: '2FA non activé pour cet utilisateur'
        };
      }

      // Désactiver 2FA et supprimer le secret et les codes de récupération
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      user.twoFactorRecoveryCodes = null;
      await user.save();

      return {
        success: true,
        message: '2FA désactivé avec succès'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la désactivation 2FA'
      };
    }
  }

  // Vérifier un code de récupération
  static async verifyRecoveryCode(userId: string, recoveryCode: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé'
        };
      }

      if (!user.twoFactorEnabled || !user.twoFactorRecoveryCodes) {
        return {
          success: false,
          message: '2FA non activé pour cet utilisateur'
        };
      }

      // Vérifier le code de récupération
      const codeIndex = user.twoFactorRecoveryCodes.indexOf(recoveryCode.toUpperCase());
      if (codeIndex === -1) {
        return {
          success: false,
          message: 'Code de récupération invalide'
        };
      }

      // Supprimer le code utilisé
      user.twoFactorRecoveryCodes.splice(codeIndex, 1);
      await user.save();

      return {
        success: true,
        message: 'Code de récupération vérifié avec succès'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la vérification du code de récupération'
      };
    }
  }

  // Générer des codes de récupération
  static generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Générer un code de 8 caractères alphanumériques
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}

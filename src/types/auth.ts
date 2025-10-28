import { Request } from 'express';
import { UserDocument } from '../models/User';

// Interface User
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'visiteur' | 'particulier' | 'entreprise' | 'admin';
  phone?: string | undefined;
  avatar?: string | undefined;
  isVerified: boolean;
  subscriptionType: 'gratuit' | 'pro' | 'premium';
  companyName?: string | undefined;
  isKYCVerified?: boolean | undefined;
  twoFactorEnabled?: boolean | undefined;
  lastLogin?: Date | undefined;
  isActive: boolean;
  companyInfo?: {
    siret?: string;
    address?: string;
  } | undefined;
}

// Données d'authentification
export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role?: 'visiteur' | 'particulier' | 'entreprise' | 'admin';
  companyName?: string;
  companyInfo?: {
    siret?: string;
    address?: string;
  };
}

// Réponse d'authentification
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Payload JWT
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  subscriptionType: string;
}

// Requête authentifiée
export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}
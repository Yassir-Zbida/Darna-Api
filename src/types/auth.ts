import { Request } from 'express';

export interface IUser {
    email:string;
    password: string;
    name: string;
    role: 'visiteur'|'particulier'|'entreprise' |'admin';
    phone?: string;
    avatar?: string;
    isVerified: boolean;
    verificationToken?: string;
    verificationTokenExpiry?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    refreshTokens?: StoredRefreshToken[];
    subscriptionType?: 'gratuit'|'pro'|'premium';
    companyName?: string;
    isKYCVerified?: boolean;
    twoFactorEnabled?: boolean;
    lastLogin?: Date;
    isActive?: boolean;
    companyInfo?: {
        siret?: string;
        address?: string;
    };
    refreshTokens?: StoredRefreshToken[];
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: 'visiteur'|'particulier'|'entreprise'|'admin';
}

export interface AuthResponse {
    success: boolean;
    message: string;
    accessToken?: string;
    refreshToken?: string;
    user?: Omit<IUser, 'password'>;
}

export interface JwtPayLoad {
    userId: string;
    email: string;
    role: string;
    tokenType: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenData {
    refreshToken: string;
}

export interface StoredRefreshToken {
    token: string;
    createdAt: Date;
    expiresAt: Date;
    isRevoked: boolean;
    deviceInfo?: {
        userAgent?: string;
        ipAddress?: string;
    };
}

export interface DeviceInfo {
    userAgent?: string;
    ipAddress?: string;
}

export interface TokenResponse {
    success: boolean;
    message: string;
    accessToken?: string;
    refreshToken?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface AuthenticatedRequest extends Request {
    user?: Omit<IUser, 'password'>;
}

/**
 * Options pour le middleware d'authentification
 */
export interface AuthOptions {
    roles?: string[];
    subscription?: 'gratuit' | 'pro' | 'premium';
    ownership?: string;
    optional?: boolean;
}
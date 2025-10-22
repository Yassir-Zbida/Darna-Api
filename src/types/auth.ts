export interface IUser {
    email:string;
    password: string;
    name: string;
    role: 'visiteur'|'particulier'|'entreprise' |'admin';
    phone?: string;
    avatar?: string;
    isVerified: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
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
    role?: 'user'|'admin'|'agent';
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?:string;
    user?: Omit<IUser, 'password'>;
}

export interface JwtPayLoad {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}
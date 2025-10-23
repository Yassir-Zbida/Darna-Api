import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { 
    LoginCredentials, 
    AuthResponse, 
    JwtPayLoad, 
    IUser,
    TokenPair,
    RefreshTokenData,
    TokenResponse
} from '../types/auth';
import logger from '../utils/logger';

export class AuthService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    private static readonly JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    private static readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    private static readonly BCRYPT_ROUNDS = 12;

    /**
     * Authenticate user with email and password
     * @param credentials - User login credentials
     * @returns Promise<AuthResponse>
     */
    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const { email, password } = credentials;

            // Validate input
            if (!email || !password) {
                return {
                    success: false,
                    message: 'Email et mot de passe sont requis'
                };
            }

            // Find user by email
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                logger.warn(`Tentative de connexion avec un email inexistant: ${email}`);
                return {
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                };
            }

            // Check if user is active
            if (!user.isActive) {
                logger.warn(`Tentative de connexion avec un compte inactif: ${email}`);
                return {
                    success: false,
                    message: 'Votre compte a été désactivé. Contactez le support.'
                };
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                logger.warn(`Tentative de connexion avec un mot de passe incorrect: ${email}`);
                return {
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                };
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate JWT tokens
            const tokens = this.generateTokenPair({
                userId: (user._id as any).toString(),
                email: user.email,
                role: user.role
            });

            // Remove password from user object
            const userWithoutPassword = this.sanitizeUser(user);

            logger.info(`Connexion réussie pour l'utilisateur: ${email}`);

            return {
                success: true,
                message: 'Connexion réussie',
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: userWithoutPassword
            };

        } catch (error) {
            logger.error('Erreur lors de la connexion:', error);
            return {
                success: false,
                message: 'Une erreur interne est survenue'
            };
        }
    }

    /**
     * Hash a password
     * @param password - Plain text password
     * @returns Promise<string>
     */
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.BCRYPT_ROUNDS);
    }

    /**
     * Verify a password against a hash
     * @param password - Plain text password
     * @param hash - Hashed password
     * @returns Promise<boolean>
     */
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Generate access and refresh token pair
     * @param payload - JWT payload
     * @returns TokenPair
     */
    static generateTokenPair(payload: Omit<JwtPayLoad, 'iat' | 'exp' | 'tokenType'>): TokenPair {
        const accessTokenPayload = {
            ...payload,
            tokenType: 'access' as const
        };
        
        const refreshTokenPayload = {
            ...payload,
            tokenType: 'refresh' as const
        };

        const accessToken = jwt.sign(accessTokenPayload, this.JWT_SECRET, {
            expiresIn: this.JWT_ACCESS_EXPIRES_IN
        } as jwt.SignOptions);

        const refreshToken = jwt.sign(refreshTokenPayload, this.JWT_REFRESH_SECRET, {
            expiresIn: this.JWT_REFRESH_EXPIRES_IN
        } as jwt.SignOptions);

        return {
            accessToken,
            refreshToken
        };
    }

    /**
     * Generate access token only
     * @param payload - JWT payload
     * @returns string
     */
    static generateAccessToken(payload: Omit<JwtPayLoad, 'iat' | 'exp' | 'tokenType'>): string {
        const accessTokenPayload = {
            ...payload,
            tokenType: 'access' as const
        };

        return jwt.sign(accessTokenPayload, this.JWT_SECRET, {
            expiresIn: this.JWT_ACCESS_EXPIRES_IN
        } as jwt.SignOptions);
    }

    /**
     * Generate refresh token only
     * @param payload - JWT payload
     * @returns string
     */
    static generateRefreshToken(payload: Omit<JwtPayLoad, 'iat' | 'exp' | 'tokenType'>): string {
        const refreshTokenPayload = {
            ...payload,
            tokenType: 'refresh' as const
        };

        return jwt.sign(refreshTokenPayload, this.JWT_REFRESH_SECRET, {
            expiresIn: this.JWT_REFRESH_EXPIRES_IN
        } as jwt.SignOptions);
    }

    /**
     * Verify access token
     * @param token - Access token
     * @returns JwtPayLoad | null
     */
    static verifyAccessToken(token: string): JwtPayLoad | null {
        try {
            const payload = jwt.verify(token, this.JWT_SECRET) as JwtPayLoad;
            if (payload.tokenType !== 'access') {
                logger.warn('Token invalide: ce n\'est pas un access token');
                return null;
            }
            return payload;
        } catch (error) {
            logger.error('Erreur lors de la vérification de l\'access token:', error);
            return null;
        }
    }

    /**
     * Verify refresh token
     * @param token - Refresh token
     * @returns JwtPayLoad | null
     */
    static verifyRefreshToken(token: string): JwtPayLoad | null {
        try {
            const payload = jwt.verify(token, this.JWT_REFRESH_SECRET) as JwtPayLoad;
            if (payload.tokenType !== 'refresh') {
                logger.warn('Token invalide: ce n\'est pas un refresh token');
                return null;
            }
            return payload;
        } catch (error) {
            logger.error('Erreur lors de la vérification du refresh token:', error);
            return null;
        }
    }

    /**
     * Refresh access token using refresh token
     * @param refreshTokenData - Refresh token data
     * @returns Promise<TokenResponse>
     */
    static async refreshAccessToken(refreshTokenData: RefreshTokenData): Promise<TokenResponse> {
        try {
            const { refreshToken } = refreshTokenData;

            // Verify refresh token
            const payload = this.verifyRefreshToken(refreshToken);
            if (!payload) {
                return {
                    success: false,
                    message: 'Refresh token invalide ou expiré'
                };
            }

            // Check if user still exists and is active
            const user = await User.findById(payload.userId);
            if (!user || !user.isActive) {
                return {
                    success: false,
                    message: 'Utilisateur introuvable ou inactif'
                };
            }

            // Generate new access token
            const newAccessToken = this.generateAccessToken({
                userId: payload.userId,
                email: payload.email,
                role: payload.role
            });

            logger.info(`Nouveau access token généré pour l'utilisateur: ${payload.email}`);

            return {
                success: true,
                message: 'Access token renouvelé avec succès',
                accessToken: newAccessToken,
                refreshToken: refreshToken // Keep the same refresh token
            };

        } catch (error) {
            logger.error('Erreur lors du renouvellement du token:', error);
            return {
                success: false,
                message: 'Une erreur interne est survenue'
            };
        }
    }

    /**
     * Verify any JWT token (legacy method for backward compatibility)
     * @param token - JWT token
     * @returns JwtPayLoad | null
     */
    static verifyToken(token: string): JwtPayLoad | null {
        // Try to verify as access token first
        let payload = this.verifyAccessToken(token);
        if (payload) return payload;

        // Try to verify as refresh token
        payload = this.verifyRefreshToken(token);
        return payload;
    }

    /**
     * Get user by ID
     * @param userId - User ID
     * @returns Promise<Omit<IUser, 'password'> | null>
     */
    static async getUserById(userId: string): Promise<Omit<IUser, 'password'> | null> {
        try {
            const user = await User.findById(userId);
            return user ? this.sanitizeUser(user) : null;
        } catch (error) {
            logger.error('Erreur lors de la récupération de l\'utilisateur:', error);
            return null;
        }
    }

    /**
     * Get user by email
     * @param email - User email
     * @returns Promise<Omit<IUser, 'password'> | null>
     */
    static async getUserByEmail(email: string): Promise<Omit<IUser, 'password'> | null> {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            return user ? this.sanitizeUser(user) : null;
        } catch (error) {
            logger.error('Erreur lors de la récupération de l\'utilisateur par email:', error);
            return null;
        }
    }

    /**
     * Validate email format
     * @param email - Email to validate
     * @returns boolean
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     * @param password - Password to validate
     * @returns { isValid: boolean, message: string }
     */
    static validatePassword(password: string): { isValid: boolean, message: string } {
        if (password.length < 8) {
            return {
                isValid: false,
                message: 'Le mot de passe doit contenir au moins 8 caractères'
            };
        }

        if (password.length > 128) {
            return {
                isValid: false,
                message: 'Le mot de passe ne peut pas dépasser 128 caractères'
            };
        }

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            return {
                isValid: false,
                message: 'Le mot de passe doit contenir au moins une majuscule'
            };
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            return {
                isValid: false,
                message: 'Le mot de passe doit contenir au moins une minuscule'
            };
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            return {
                isValid: false,
                message: 'Le mot de passe doit contenir au moins un chiffre'
            };
        }

        return {
            isValid: true,
            message: 'Mot de passe valide'
        };
    }

    /**
     * Remove sensitive information from user object
     * @param user - User document
     * @returns User without password
     */
    private static sanitizeUser(user: any): Omit<IUser, 'password'> {
        const userObj = user.toObject ? user.toObject() : user;
        const { password, ...userWithoutPassword } = userObj;
        return userWithoutPassword;
    }

    /**
     * Check if user account is locked (for future implementation)
     * @param user - User document
     * @returns boolean
     */
    static isAccountLocked(user: IUser): boolean {
        // Future implementation for account locking after failed attempts
        return false;
    }

    /**
     * Logout user (invalidate tokens)
     * @param userId - User ID
     * @returns Promise<{ success: boolean, message: string }>
     */
    static async logout(userId: string): Promise<{ success: boolean, message: string }> {
        try {
            // In a real implementation, you would:
            // 1. Add tokens to a blacklist
            // 2. Store blacklisted tokens in Redis or database
            // 3. Check blacklist during token verification
            
            logger.info(`Déconnexion de l'utilisateur: ${userId}`);
            
            return {
                success: true,
                message: 'Déconnexion réussie'
            };
        } catch (error) {
            logger.error('Erreur lors de la déconnexion:', error);
            return {
                success: false,
                message: 'Erreur lors de la déconnexion'
            };
        }
    }

    /**
     * Check if token is blacklisted (for future implementation)
     * @param token - JWT token
     * @returns boolean
     */
    static isTokenBlacklisted(token: string): boolean {
        // Future implementation: check Redis or database for blacklisted tokens
        return false;
    }

    /**
     * Blacklist token (for future implementation)
     * @param token - JWT token to blacklist
     * @returns Promise<void>
     */
    static async blacklistToken(token: string): Promise<void> {
        // Future implementation: add token to blacklist in Redis or database
        logger.info('Token ajouté à la liste noire');
    }

    /**
     * Get token expiration time
     * @param token - JWT token
     * @returns Date | null
     */
    static getTokenExpiration(token: string): Date | null {
        try {
            const decoded = jwt.decode(token) as JwtPayLoad;
            if (decoded && decoded.exp) {
                return new Date(decoded.exp * 1000);
            }
            return null;
        } catch (error) {
            logger.error('Erreur lors de la récupération de l\'expiration du token:', error);
            return null;
        }
    }

    /**
     * Check if token is expired
     * @param token - JWT token
     * @returns boolean
     */
    static isTokenExpired(token: string): boolean {
        const expiration = this.getTokenExpiration(token);
        if (!expiration) return true;
        return new Date() > expiration;
    }

    /**
     * Log failed login attempt (for future implementation)
     * @param email - User email
     * @param ip - User IP address
     */
    static async logFailedAttempt(email: string, ip?: string): Promise<void> {
        logger.warn(`Tentative de connexion échouée pour ${email} depuis ${ip || 'IP inconnue'}`);
        // Future implementation: store failed attempts in database
    }
}

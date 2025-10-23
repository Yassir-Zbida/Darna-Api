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
    TokenResponse,
    StoredRefreshToken,
    DeviceInfo
} from '../types/auth';
import { 
    AuthErrorType, 
    AuthError, 
    createAuthError, 
    createErrorResponse 
} from '../types/errors';
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
                const error = createAuthError(AuthErrorType.REQUIRED_FIELDS_MISSING, {
                    missingFields: [
                        !email ? 'email' : null,
                        !password ? 'password' : null
                    ].filter(Boolean)
                });
                logger.warn('Tentative de connexion avec des champs manquants', { email: !!email });
                return {
                    success: false,
                    message: error.message
                };
            }

            // Validate email format
            if (!this.isValidEmail(email)) {
                const error = createAuthError(AuthErrorType.EMAIL_INVALID, { email });
                logger.warn(`Tentative de connexion avec un email invalide: ${email}`);
                return {
                    success: false,
                    message: error.message
                };
            }

            // Find user by email
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                const error = createAuthError(AuthErrorType.ACCOUNT_NOT_FOUND, { email });
                logger.warn(`Tentative de connexion avec un email inexistant: ${email}`);
                return {
                    success: false,
                    message: error.message
                };
            }

            // Check if user is active
            if (!user.isActive) {
                const error = createAuthError(AuthErrorType.ACCOUNT_INACTIVE, { 
                    email, 
                    userId: user._id 
                });
                logger.warn(`Tentative de connexion avec un compte inactif: ${email}`);
                return {
                    success: false,
                    message: error.message
                };
            }

            // Check if account is locked (for future implementation)
            if (this.isAccountLocked(user)) {
                const error = createAuthError(AuthErrorType.ACCOUNT_LOCKED, { 
                    email, 
                    userId: user._id 
                });
                logger.warn(`Tentative de connexion avec un compte verrouillé: ${email}`);
                return {
                    success: false,
                    message: error.message
                };
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                const error = createAuthError(AuthErrorType.INCORRECT_PASSWORD, { 
                    email, 
                    userId: user._id 
                });
                logger.warn(`Tentative de connexion avec un mot de passe incorrect: ${email}`);
                
                // Log failed attempt for security monitoring
                await this.logFailedAttempt(email);
                
                return {
                    success: false,
                    message: error.message
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

            logger.info(`Connexion réussie pour l'utilisateur: ${email}`, {
                userId: user._id,
                role: user.role,
                lastLogin: user.lastLogin
            });

            return {
                success: true,
                message: 'Connexion réussie',
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: userWithoutPassword
            };

        } catch (error) {
            logger.error('Erreur lors de la connexion:', error);
            const authError = createAuthError(AuthErrorType.INTERNAL_ERROR, { 
                originalError: error instanceof Error ? error.message : 'Unknown error' 
            });
            return {
                success: false,
                message: authError.message
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
     * Refresh access token using refresh token with rotation
     * @param refreshTokenData - Refresh token data
     * @param deviceInfo - Device information for security
     * @returns Promise<TokenResponse>
     */
    static async refreshAccessToken(refreshTokenData: RefreshTokenData, deviceInfo?: DeviceInfo): Promise<TokenResponse> {
        try {
            const { refreshToken } = refreshTokenData;

            // Validate refresh token presence
            if (!refreshToken) {
                const error = createAuthError(AuthErrorType.TOKEN_MISSING, { tokenType: 'refresh' });
                logger.warn('Tentative de rafraîchissement sans token');
                return {
                    success: false,
                    message: error.message
                };
            }

            // Verify refresh token
            const payload = this.verifyRefreshToken(refreshToken);
            if (!payload) {
                const error = createAuthError(AuthErrorType.REFRESH_TOKEN_INVALID, { 
                    token: refreshToken.substring(0, 20) + '...' 
                });
                logger.warn('Tentative de rafraîchissement avec un token invalide');
                return {
                    success: false,
                    message: error.message
                };
            }

            // Check if user still exists and is active
            const user = await User.findById(payload.userId);
            if (!user) {
                const error = createAuthError(AuthErrorType.ACCOUNT_NOT_FOUND, { 
                    userId: payload.userId 
                });
                logger.warn(`Tentative de rafraîchissement pour un utilisateur inexistant: ${payload.userId}`);
                return {
                    success: false,
                    message: error.message
                };
            }

            if (!user.isActive) {
                const error = createAuthError(AuthErrorType.ACCOUNT_INACTIVE, { 
                    userId: payload.userId,
                    email: user.email 
                });
                logger.warn(`Tentative de rafraîchissement pour un compte inactif: ${user.email}`);
                return {
                    success: false,
                    message: error.message
                };
            }

            // Check if refresh token exists in database and is not revoked
            const storedToken = await this.findStoredRefreshToken(user, refreshToken);
            if (!storedToken) {
                const error = createAuthError(AuthErrorType.REFRESH_TOKEN_INVALID, { 
                    reason: 'Token not found in database' 
                });
                logger.warn(`Token de rafraîchissement introuvable en base: ${user.email}`);
                return {
                    success: false,
                    message: error.message
                };
            }

            if (storedToken.isRevoked) {
                const error = createAuthError(AuthErrorType.TOKEN_REVOKED, { 
                    userId: payload.userId 
                });
                logger.warn(`Tentative d'utilisation d'un token révoqué: ${user.email}`);
                return {
                    success: false,
                    message: error.message
                };
            }

            // Check if token is expired
            if (new Date() > storedToken.expiresAt) {
                // Clean up expired token
                await this.revokeRefreshToken(user, refreshToken);
                const error = createAuthError(AuthErrorType.TOKEN_EXPIRED, { 
                    userId: payload.userId,
                    expiredAt: storedToken.expiresAt 
                });
                logger.warn(`Token de rafraîchissement expiré: ${user.email}`);
                return {
                    success: false,
                    message: error.message
                };
            }

            // Generate new access token
            const newAccessToken = this.generateAccessToken({
                userId: payload.userId,
                email: payload.email,
                role: payload.role
            });

            // Generate new refresh token (token rotation)
            const newRefreshToken = this.generateRefreshToken({
                userId: payload.userId,
                email: payload.email,
                role: payload.role
            });

            // Store new refresh token and revoke old one
            await this.storeRefreshToken(user, newRefreshToken, deviceInfo);
            await this.revokeRefreshToken(user, refreshToken);

            logger.info(`Tokens renouvelés avec rotation pour l'utilisateur: ${payload.email}`, {
                userId: payload.userId,
                deviceInfo
            });

            return {
                success: true,
                message: 'Tokens renouvelés avec succès',
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };

        } catch (error) {
            logger.error('Erreur lors du renouvellement du token:', error);
            const authError = createAuthError(AuthErrorType.INTERNAL_ERROR, { 
                originalError: error instanceof Error ? error.message : 'Unknown error' 
            });
            return {
                success: false,
                message: authError.message
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
     * Store refresh token in database
     * @param user - User document
     * @param refreshToken - Refresh token to store
     * @param deviceInfo - Device information
     */
    static async storeRefreshToken(user: any, refreshToken: string, deviceInfo?: DeviceInfo): Promise<void> {
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

            const tokenData = {
                token: refreshToken,
                expiresAt,
                deviceInfo: deviceInfo || {}
            };

            user.refreshTokens.push(tokenData);
            await user.save();

            logger.info(`Refresh token stocké pour l'utilisateur: ${user.email}`);
        } catch (error) {
            logger.error('Erreur lors du stockage du refresh token:', error);
            throw error;
        }
    }

    /**
     * Find stored refresh token
     * @param user - User document
     * @param refreshToken - Refresh token to find
     * @returns StoredRefreshToken | null
     */
    static async findStoredRefreshToken(user: any, refreshToken: string): Promise<StoredRefreshToken | null> {
        try {
            const storedToken = user.refreshTokens.find((token: any) => 
                token.token === refreshToken && !token.isRevoked
            );
            return storedToken || null;
        } catch (error) {
            logger.error('Erreur lors de la recherche du refresh token:', error);
            return null;
        }
    }

    /**
     * Revoke refresh token
     * @param user - User document
     * @param refreshToken - Refresh token to revoke
     */
    static async revokeRefreshToken(user: any, refreshToken: string): Promise<void> {
        try {
            const tokenIndex = user.refreshTokens.findIndex((token: any) => 
                token.token === refreshToken
            );

            if (tokenIndex !== -1) {
                user.refreshTokens[tokenIndex].isRevoked = true;
                await user.save();
                logger.info(`Refresh token révoqué pour l'utilisateur: ${user.email}`);
            }
        } catch (error) {
            logger.error('Erreur lors de la révocation du refresh token:', error);
            throw error;
        }
    }

    /**
     * Revoke all refresh tokens for a user
     * @param user - User document
     */
    static async revokeAllRefreshTokens(user: any): Promise<void> {
        try {
            user.refreshTokens.forEach((token: any) => {
                token.isRevoked = true;
            });
            await user.save();
            logger.info(`Tous les refresh tokens révoqués pour l'utilisateur: ${user.email}`);
        } catch (error) {
            logger.error('Erreur lors de la révocation de tous les refresh tokens:', error);
            throw error;
        }
    }

    /**
     * Clean up expired refresh tokens
     * @param user - User document
     */
    static async cleanupExpiredRefreshTokens(user: any): Promise<void> {
        try {
            const now = new Date();
            user.refreshTokens = user.refreshTokens.filter((token: any) => 
                token.expiresAt > now && !token.isRevoked
            );
            await user.save();
            logger.info(`Tokens expirés nettoyés pour l'utilisateur: ${user.email}`);
        } catch (error) {
            logger.error('Erreur lors du nettoyage des tokens expirés:', error);
            throw error;
        }
    }

    /**
     * Get active refresh tokens for a user
     * @param userId - User ID
     * @returns Promise<StoredRefreshToken[]>
     */
    static async getActiveRefreshTokens(userId: string): Promise<StoredRefreshToken[]> {
        try {
            const user = await User.findById(userId);
            if (!user) return [];

            const now = new Date();
            return (user as any).refreshTokens.filter((token: any) => 
                token.expiresAt > now && !token.isRevoked
            );
        } catch (error) {
            logger.error('Erreur lors de la récupération des tokens actifs:', error);
            return [];
        }
    }

    /**
     * Update login method to store refresh token
     * @param credentials - Login credentials
     * @param deviceInfo - Device information
     * @returns Promise<AuthResponse>
     */
    static async loginWithDeviceInfo(credentials: LoginCredentials, deviceInfo?: DeviceInfo): Promise<AuthResponse> {
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

            // Store refresh token
            await this.storeRefreshToken(user, tokens.refreshToken, deviceInfo);

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
     * Register a new user
     * @param userData - User registration data
     * @returns Promise<AuthResponse>
     */
    static async register(userData: any): Promise<any> {
        try {
            const { email, password, name, phone, role } = userData;

            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return {
                    success: false,
                    message: 'Cet email existe déjà'
                };
            }

            // Hash password
            const hashedPassword = await this.hashPassword(password);

            // Create new user
            const newUser = new User({
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                phone,
                role: role || 'particulier',
                isActive: true,
                isVerified: false
            });

            await newUser.save();

            // Generate tokens
            const tokens = this.generateTokenPair({
                userId: (newUser._id as any).toString(),
                email: newUser.email,
                role: newUser.role
            });

            // Store refresh token
            await this.storeRefreshToken(newUser, tokens.refreshToken);

            logger.info(`Nouvel utilisateur enregistré: ${email}`);

            return {
                success: true,
                message: 'Utilisateur créé avec succès',
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: this.sanitizeUser(newUser)
            };

        } catch (error) {
            logger.error('Erreur lors de l\'inscription:', error);
            return {
                success: false,
                message: 'Erreur lors de la création de l\'utilisateur'
            };
        }
    }

    /**
     * Log failed login attempt with enhanced security monitoring
     * @param email - User email
     * @param ip - User IP address
     * @param reason - Reason for failure
     */
    static async logFailedAttempt(email: string, ip?: string, reason?: string): Promise<void> {
        const logData = {
            email,
            ip: ip || 'IP inconnue',
            reason: reason || 'Mot de passe incorrect',
            timestamp: new Date().toISOString(),
            userAgent: 'Unknown' // Could be passed from controller
        };

        logger.warn(`Tentative de connexion échouée`, logData);
        
        // Future implementation: 
        // 1. Store failed attempts in database with rate limiting
        // 2. Implement account lockout after multiple failed attempts
        // 3. Send security alerts for suspicious activity
        // 4. Track device fingerprinting for security analysis
    }

    /**
     * Check for suspicious login patterns
     * @param email - User email
     * @param ip - User IP address
     * @returns Promise<boolean> - true if suspicious
     */
    static async isSuspiciousActivity(email: string, ip?: string): Promise<boolean> {
        try {
            // Future implementation: check for:
            // 1. Multiple failed attempts from same IP
            // 2. Login attempts from unusual locations
            // 3. Rapid successive attempts
            // 4. Known malicious IP addresses
            
            logger.info(`Vérification d'activité suspecte pour ${email} depuis ${ip || 'IP inconnue'}`);
            return false; // Placeholder
        } catch (error) {
            logger.error('Erreur lors de la vérification d\'activité suspecte:', error);
            return false;
        }
    }

    /**
     * Get failed attempt count for user
     * @param email - User email
     * @param timeWindow - Time window in minutes
     * @returns Promise<number>
     */
    static async getFailedAttemptCount(email: string, timeWindow: number = 15): Promise<number> {
        try {
            // Future implementation: query database for failed attempts
            // within the specified time window
            logger.info(`Récupération du nombre de tentatives échouées pour ${email} dans les ${timeWindow} dernières minutes`);
            return 0; // Placeholder
        } catch (error) {
            logger.error('Erreur lors de la récupération des tentatives échouées:', error);
            return 0;
        }
    }
}

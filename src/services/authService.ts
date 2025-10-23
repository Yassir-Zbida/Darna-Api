import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { 
    LoginCredentials, 
    AuthResponse, 
    JwtPayLoad, 
    IUser 
} from '../types/auth';
import logger from '../utils/logger';

export class AuthService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
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

            // Generate JWT token
            const token = this.generateToken({
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
                token,
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
     * Generate JWT token
     * @param payload - JWT payload
     * @returns string
     */
    static generateToken(payload: Omit<JwtPayLoad, 'iat' | 'exp'>): string {
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN
        } as jwt.SignOptions);
    }

    /**
     * Verify JWT token
     * @param token - JWT token
     * @returns JwtPayLoad | null
     */
    static verifyToken(token: string): JwtPayLoad | null {
        try {
            return jwt.verify(token, this.JWT_SECRET) as JwtPayLoad;
        } catch (error) {
            logger.error('Erreur lors de la vérification du token:', error);
            return null;
        }
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
     * Log failed login attempt (for future implementation)
     * @param email - User email
     * @param ip - User IP address
     */
    static async logFailedAttempt(email: string, ip?: string): Promise<void> {
        logger.warn(`Tentative de connexion échouée pour ${email} depuis ${ip || 'IP inconnue'}`);
        // Future implementation: store failed attempts in database
    }
}

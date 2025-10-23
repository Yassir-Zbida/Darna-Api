/**
 * Authentication Error Types and Constants
 */

export enum AuthErrorType {
    // Authentication Errors
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
    INCORRECT_PASSWORD = 'INCORRECT_PASSWORD',
    ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
    ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
    
    // Token Errors
    TOKEN_INVALID = 'TOKEN_INVALID',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    TOKEN_REVOKED = 'TOKEN_REVOKED',
    TOKEN_MISSING = 'TOKEN_MISSING',
    REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
    
    // Validation Errors
    EMAIL_INVALID = 'EMAIL_INVALID',
    PASSWORD_WEAK = 'PASSWORD_WEAK',
    REQUIRED_FIELDS_MISSING = 'REQUIRED_FIELDS_MISSING',
    
    // Security Errors
    TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
    
    // Server Errors
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface AuthError {
    type: AuthErrorType;
    message: string;
    statusCode: number;
    details?: any;
    timestamp: Date;
}

export interface ErrorResponse {
    success: false;
    error: {
        type: AuthErrorType;
        message: string;
        statusCode: number;
        timestamp: string;
        details?: any;
    };
}

/**
 * Error Messages in French
 */
export const ERROR_MESSAGES = {
    [AuthErrorType.INVALID_CREDENTIALS]: 'Email ou mot de passe incorrect',
    [AuthErrorType.ACCOUNT_NOT_FOUND]: 'Aucun compte trouvé avec cet email',
    [AuthErrorType.INCORRECT_PASSWORD]: 'Mot de passe incorrect',
    [AuthErrorType.ACCOUNT_INACTIVE]: 'Votre compte a été désactivé. Contactez le support.',
    [AuthErrorType.ACCOUNT_LOCKED]: 'Votre compte a été verrouillé. Contactez le support.',
    
    [AuthErrorType.TOKEN_INVALID]: 'Token d\'authentification invalide',
    [AuthErrorType.TOKEN_EXPIRED]: 'Token d\'authentification expiré',
    [AuthErrorType.TOKEN_REVOKED]: 'Token d\'authentification révoqué',
    [AuthErrorType.TOKEN_MISSING]: 'Token d\'authentification manquant',
    [AuthErrorType.REFRESH_TOKEN_INVALID]: 'Token de rafraîchissement invalide ou expiré',
    
    [AuthErrorType.EMAIL_INVALID]: 'Format d\'email invalide',
    [AuthErrorType.PASSWORD_WEAK]: 'Le mot de passe ne respecte pas les critères de sécurité',
    [AuthErrorType.REQUIRED_FIELDS_MISSING]: 'Champs requis manquants',
    
    [AuthErrorType.TOO_MANY_ATTEMPTS]: 'Trop de tentatives de connexion. Réessayez plus tard.',
    [AuthErrorType.SUSPICIOUS_ACTIVITY]: 'Activité suspecte détectée. Votre compte a été temporairement verrouillé.',
    
    [AuthErrorType.INTERNAL_ERROR]: 'Erreur interne du serveur',
    [AuthErrorType.DATABASE_ERROR]: 'Erreur de base de données',
    [AuthErrorType.NETWORK_ERROR]: 'Erreur de réseau'
};

/**
 * HTTP Status Codes for each error type
 */
export const ERROR_STATUS_CODES = {
    [AuthErrorType.INVALID_CREDENTIALS]: 401,
    [AuthErrorType.ACCOUNT_NOT_FOUND]: 404,
    [AuthErrorType.INCORRECT_PASSWORD]: 401,
    [AuthErrorType.ACCOUNT_INACTIVE]: 403,
    [AuthErrorType.ACCOUNT_LOCKED]: 423,
    
    [AuthErrorType.TOKEN_INVALID]: 401,
    [AuthErrorType.TOKEN_EXPIRED]: 401,
    [AuthErrorType.TOKEN_REVOKED]: 401,
    [AuthErrorType.TOKEN_MISSING]: 401,
    [AuthErrorType.REFRESH_TOKEN_INVALID]: 401,
    
    [AuthErrorType.EMAIL_INVALID]: 400,
    [AuthErrorType.PASSWORD_WEAK]: 400,
    [AuthErrorType.REQUIRED_FIELDS_MISSING]: 400,
    
    [AuthErrorType.TOO_MANY_ATTEMPTS]: 429,
    [AuthErrorType.SUSPICIOUS_ACTIVITY]: 423,
    
    [AuthErrorType.INTERNAL_ERROR]: 500,
    [AuthErrorType.DATABASE_ERROR]: 500,
    [AuthErrorType.NETWORK_ERROR]: 503
};

/**
 * Create a standardized error response
 */
export function createErrorResponse(
    type: AuthErrorType,
    details?: any
): ErrorResponse {
    return {
        success: false,
        error: {
            type,
            message: ERROR_MESSAGES[type],
            statusCode: ERROR_STATUS_CODES[type],
            timestamp: new Date().toISOString(),
            details
        }
    };
}

/**
 * Create an AuthError object
 */
export function createAuthError(
    type: AuthErrorType,
    details?: any
): AuthError {
    return {
        type,
        message: ERROR_MESSAGES[type],
        statusCode: ERROR_STATUS_CODES[type],
        details,
        timestamp: new Date()
    };
}

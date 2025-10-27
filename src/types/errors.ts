// Gestion d'erreurs
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  SERVER_ERROR = 'SERVER_ERROR'
}

export interface ErrorResponse {
  success: false;
  error: {
    type: ErrorType;
    message: string;
    statusCode: number;
  };
}

// Messages d'erreur
export const ERROR_MESSAGES = {
  [ErrorType.VALIDATION_ERROR]: 'Données invalides',
  [ErrorType.AUTH_ERROR]: 'Non autorisé',
  [ErrorType.NOT_FOUND]: 'Ressource non trouvée',
  [ErrorType.FORBIDDEN]: 'Accès interdit',
  [ErrorType.SERVER_ERROR]: 'Erreur serveur'
};

// Codes de statut
export const ERROR_STATUS_CODES = {
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.AUTH_ERROR]: 401,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.SERVER_ERROR]: 500
};

// Créer une réponse d'erreur
export function createErrorResponse(
  type: ErrorType,
  message?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      type,
      message: message || ERROR_MESSAGES[type],
      statusCode: ERROR_STATUS_CODES[type]
    }
  };
}
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import logger from '../utils/logger';

/**
 * Middleware de validation des données
 * Valide les données de requête selon les règles express-validator
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(error => ({
                field: error.type === 'field' ? error.path : 'unknown',
                message: error.msg
            }));

            logger.warn('Erreurs de validation', { errors: formattedErrors });

            res.status(400).json({
                success: false,
                error: {
                    message: 'Erreurs de validation',
                    statusCode: 400,
                    validationErrors: formattedErrors
                }
            });
            return;
        }

        next();

    } catch (error) {
        logger.error('Erreur dans le middleware de validation:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erreur interne du serveur',
                statusCode: 500
            }
        });
    }
};

/**
 * Middleware de validation des fichiers uploadés
 * Vérifie la taille, le type et la présence des fichiers
 */
export const validateFile = (options: {
    maxSize?: number;
    allowedTypes?: string[];
    required?: boolean;
} = {}) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const { maxSize = 5 * 1024 * 1024, allowedTypes = [], required = false } = options;
            const files = req.files as Express.Multer.File[] | undefined;
            const file = req.file as Express.Multer.File | undefined;

            // Vérifier si des fichiers sont requis
            if (required && !files && !file) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Fichier(s) requis',
                        statusCode: 400
                    }
                });
                return;
            }

            // Traiter les fichiers
            const filesToCheck = files || (file ? [file] : []);
            
            for (const uploadedFile of filesToCheck) {
                // Vérifier la taille
                if (uploadedFile.size > maxSize) {
                    res.status(400).json({
                        success: false,
                        error: {
                            message: `Fichier trop volumineux. Maximum: ${Math.round(maxSize / (1024 * 1024))}MB`,
                            statusCode: 400
                        }
                    });
                    return;
                }

                // Vérifier le type
                if (allowedTypes.length > 0 && !allowedTypes.includes(uploadedFile.mimetype)) {
                    res.status(400).json({
                        success: false,
                        error: {
                            message: `Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(', ')}`,
                            statusCode: 400
                        }
                    });
                    return;
                }
            }

            next();

        } catch (error) {
            logger.error('Erreur dans le middleware de validation des fichiers:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Erreur interne du serveur',
                    statusCode: 500
                }
            });
        }
    };
};

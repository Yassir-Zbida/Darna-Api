import { body } from 'express-validator';

class UserValidator {
    public getValidationRules() {
        return [
            body('email')
                .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
                .withMessage('Format d\'email invalide'),

            body('password')
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/)
                .withMessage('Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule et chiffre'),

            body('name')
                .matches(/^[a-zA-ZÀ-ÿ\s]{2,50}$/)
                .withMessage('Le nom doit contenir entre 2 et 50 caractères et uniquement des lettres'),

            body('phone')
                .optional()
                .matches(/^(\+212[5-7]|0[5-7])[0-9]{8}$/)
                .withMessage('Format de téléphone marocain invalide (ex: +212612345678 ou 0612345678)'),

            body('role')
                .optional()
                .isIn(['visiteur', 'particulier', 'entreprise', 'admin'])
                .withMessage('Rôle invalide'),

            body('subscriptionType')
                .optional()
                .isIn(['gratuit', 'pro', 'premium'])
                .withMessage('Type d\'abonnement invalide'),

            body('companyName')
                .optional()
                .matches(/^[a-zA-ZÀ-ÿ\s]{2,100}$/)
                .withMessage('Le nom de l\'entreprise doit contenir entre 2 et 100 caractères'),

            body('companyInfo.name')
                .optional()
                .matches(/^[a-zA-ZÀ-ÿ\s]{2,100}$/)
                .withMessage('Le nom de l\'entreprise doit contenir entre 2 et 100 caractères'),

            body('companyInfo.siret')
                .optional()
                .matches(/^[0-9]{14}$/)
                .withMessage('Le SIRET doit contenir exactement 14 chiffres'),

            body('companyInfo.address')
                .optional()
                .matches(/^[a-zA-ZÀ-ÿ0-9\s,.-]{5,200}$/)
                .withMessage('L\'adresse doit contenir entre 5 et 200 caractères')
        ];
    }
}

export const userValidator = new UserValidator();
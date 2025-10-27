import { body } from 'express-validator';

/**
 * Validations pour l'authentification
 */

// Validation pour l'inscription
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('name')
    .notEmpty()
    .withMessage('Le nom est requis')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('phone')
    .optional()
    .isMobilePhone('fr-FR')
    .withMessage('Numéro de téléphone invalide'),
  body('role')
    .optional()
    .isIn(['visiteur', 'particulier', 'entreprise', 'admin'])
    .withMessage('Rôle invalide'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le nom de l\'entreprise ne peut pas dépasser 100 caractères'),
  body('companyInfo.siret')
    .optional()
    .isLength({ min: 14, max: 14 })
    .withMessage('Le SIRET doit contenir exactement 14 caractères'),
  body('companyInfo.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères')
];

// Validation pour la connexion
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

// Validation pour la mise à jour du profil
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('phone')
    .optional()
    .isMobilePhone('fr-FR')
    .withMessage('Numéro de téléphone invalide'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le nom de l\'entreprise ne peut pas dépasser 100 caractères'),
  body('companyInfo.siret')
    .optional()
    .isLength({ min: 14, max: 14 })
    .withMessage('Le SIRET doit contenir exactement 14 caractères'),
  body('companyInfo.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères')
];

// Validation pour le changement de mot de passe
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('La confirmation du mot de passe ne correspond pas');
      }
      return true;
    })
];

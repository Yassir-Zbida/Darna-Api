import { body } from 'express-validator';

const REGEX_PATTERNS = {
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
  PHONE_MA: /^(?:(?:\+212[567])|0[567])\d{8}$/,
  SIRET: /^\d{14}$/,
  NAME: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
  EMAIL_STRICT: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  COMPANY_NAME: /^[a-zA-ZÀ-ÿ0-9\s'-]{2,100}$/,
  ADDRESS: /^[a-zA-ZÀ-ÿ0-9\s'-.,]{2,200}$/
};

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .matches(REGEX_PATTERNS.EMAIL_STRICT)
    .withMessage('Format d\'email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(REGEX_PATTERNS.PASSWORD)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  body('name')
    .notEmpty()
    .withMessage('Le nom est requis')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(REGEX_PATTERNS.NAME)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),
  body('phone')
    .optional()
    .matches(REGEX_PATTERNS.PHONE_MA)
    .withMessage('Numéro de téléphone invalide. Format attendu : 0612345678 ou +212612345678'),
  body('role')
    .optional()
    .isIn(['visiteur', 'particulier', 'entreprise', 'admin'])
    .withMessage('Rôle invalide'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le nom de l\'entreprise ne peut pas dépasser 100 caractères')
    .matches(REGEX_PATTERNS.COMPANY_NAME)
    .withMessage('Le nom de l\'entreprise contient des caractères invalides'),
  body('companyInfo.siret')
    .optional()
    .matches(REGEX_PATTERNS.SIRET)
    .withMessage('Le SIRET doit contenir exactement 14 chiffres'),
  body('companyInfo.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères')
    .matches(REGEX_PATTERNS.ADDRESS)
    .withMessage('L\'adresse contient des caractères invalides')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .matches(REGEX_PATTERNS.EMAIL_STRICT)
    .withMessage('Format d\'email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(REGEX_PATTERNS.NAME)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),
  body('phone')
    .optional()
    .matches(REGEX_PATTERNS.PHONE_MA)
    .withMessage('Numéro de téléphone invalide. Format attendu : 0612345678 ou +212612345678'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le nom de l\'entreprise ne peut pas dépasser 100 caractères')
    .matches(REGEX_PATTERNS.COMPANY_NAME)
    .withMessage('Le nom de l\'entreprise contient des caractères invalides'),
  body('companyInfo.siret')
    .optional()
    .matches(REGEX_PATTERNS.SIRET)
    .withMessage('Le SIRET doit contenir exactement 14 chiffres'),
  body('companyInfo.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères')
    .matches(REGEX_PATTERNS.ADDRESS)
    .withMessage('L\'adresse contient des caractères invalides')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
    .matches(REGEX_PATTERNS.PASSWORD)
    .withMessage('Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('La confirmation du mot de passe ne correspond pas');
      }
      return true;
    })
];

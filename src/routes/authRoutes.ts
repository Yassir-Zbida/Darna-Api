import { Router } from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/authController';
import { userValidator } from '../validators/userValidator';
import { 
    auth, 
    validate
} from '../middlewares';

const router = Router();

// Route d'inscription
router.post('/register', 
    userValidator.getValidationRules(),
    validate,
    AuthController.register
);

// Route de connexion
router.post('/login', 
    [
        body('email')
            .isEmail()
            .withMessage('Format d\'email invalide')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Le mot de passe est requis')
    ],
    validate,
    AuthController.login
);

// Route de rafraîchissement du token
router.post('/refresh-token',
    [
        body('refreshToken')
            .notEmpty()
            .withMessage('Le refresh token est requis')
    ],
    validate,
    AuthController.refreshToken
);

// Route de déconnexion (nécessite authentification)
router.post('/logout',
    auth(),
    AuthController.logout
);

// Route pour obtenir le profil utilisateur (nécessite authentification)
router.get('/me',
    auth(),
    AuthController.getProfile
);

// Route pour valider un token
router.get('/validate',
    AuthController.validateToken
);

// Route pour obtenir les tokens de rafraîchissement actifs (nécessite authentification)
router.get('/refresh-tokens',
    auth(),
    AuthController.getRefreshTokens
);

// Route pour révoquer tous les tokens (nécessite authentification)
router.post('/revoke-all-tokens',
    auth(),
    AuthController.revokeAllTokens
);

// Routes de vérification d'email (à ajouter depuis la version main)
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);

export default router;
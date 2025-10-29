import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { registerValidation, loginValidation } from '../validators/authValidate';

const router = Router();

// Routes d'authentification

// Inscription
router.post('/register', 
  registerValidation,
  validate,
  AuthController.register
);

// Connexion
router.post('/login',
  loginValidation,
  validate,
  AuthController.login
);

// Profil utilisateur (authentifié)
router.get('/profile',
  requireAuth,
  AuthController.getProfile
);

// Routes 2FA
// Configuration 2FA
router.post('/2fa/setup',
  requireAuth,
  AuthController.setup2FA
);

// Vérification et activation 2FA
router.post('/2fa/verify',
  requireAuth,
  AuthController.verify2FA
);

// Désactivation 2FA
router.post('/2fa/disable',
  requireAuth,
  AuthController.disable2FA
);

// Vérification code de récupération 2FA
router.post('/2fa/recovery',
  AuthController.verifyRecoveryCode
);

// Debug 2FA (pour le développement)
router.get('/2fa/debug',
  requireAuth,
  AuthController.debug2FA
);

export default router;
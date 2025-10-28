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

export default router;
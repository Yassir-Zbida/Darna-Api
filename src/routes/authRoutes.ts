import { Router } from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/authController';
import { userValidator } from '../validators/userValidator';

const router = Router();
const authController = new AuthController();

// Route d'inscription
router.post('/register', 
    userValidator.getValidationRules(),
    authController.register
);


export default router;

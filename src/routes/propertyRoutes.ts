import { Router } from 'express';
import { PropertyController } from '../controllers/propertyController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Routes publiques
router.get('/', PropertyController.getProperties);

// Routes protégées
router.post('/', requireAuth, PropertyController.createProperty);
router.put('/:id', requireAuth, PropertyController.updateProperty);

export default router;

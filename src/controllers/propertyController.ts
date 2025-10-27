import { Request, Response } from 'express';
import { PropertyService } from '../services/propertyService';
import { CreatePropertyData, UpdatePropertyData, PropertySearchFilters } from '../types/property';
import logger from '../utils/logger';

export class PropertyController {

  /**
   * Créer une nouvelle propriété
   * POST /api/properties
   */
  static async createProperty(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?._id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
        return;
      }

      const propertyData: CreatePropertyData = {
        ...req.body,
        ownerId: userId
      };

      const result = await PropertyService.createProperty(propertyData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Erreur dans le contrôleur createProperty:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

}

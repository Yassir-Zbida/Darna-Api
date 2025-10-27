import { Request, Response } from 'express';
import { PropertyService } from '../services/propertyService';
import { CreatePropertyData, UpdatePropertyData, PropertySearchFilters } from '../types/property';
import logger from '../utils/logger';
import { UserDocument } from '../models/User';

export class PropertyController {

  /**
   * Créer une nouvelle propriété
   * POST /api/properties
   */
  static async createProperty(req: Request & { user: UserDocument }, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

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

    /**
   * Récupérer toutes les propriétés avec filtres
   * GET /api/properties
   */
  static async getProperties(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        propertyType,
        transactionType,
        minPrice,
        maxPrice,
        minSurface,
        maxSurface,
        minRooms,
        maxRooms,
        city,
        hasParking,
        hasGarden,
        hasPool,
        energyClass
      } = req.query;

      const filters: PropertySearchFilters = {};

      if (propertyType) filters.propertyType = propertyType as any;
      if (transactionType) filters.transactionType = transactionType as any;
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      if (minSurface) filters.minSurface = Number(minSurface);
      if (maxSurface) filters.maxSurface = Number(maxSurface);
      if (minRooms) filters.minRooms = Number(minRooms);
      if (maxRooms) filters.maxRooms = Number(maxRooms);
      if (city) filters.city = city as string;
      if (hasParking === 'true') filters.hasParking = true;
      if (hasParking === 'false') filters.hasParking = false;
      if (hasGarden === 'true') filters.hasGarden = true;
      if (hasGarden === 'false') filters.hasGarden = false;
      if (hasPool === 'true') filters.hasPool = true;
      if (hasPool === 'false') filters.hasPool = false;
      if (energyClass) filters.energyClass = energyClass as string;

      const result = await PropertyService.getProperties(
        filters,
        Number(page),
        Number(limit)
      );

      res.status(200).json(result);
    } catch (error) {
      logger.error('Erreur dans le contrôleur getProperties:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

    /**
   * Mettre à jour une propriété
   * PUT /api/properties/:id
   */
  static async updateProperty(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?._id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
        return;
      }

      const updateData: UpdatePropertyData = req.body;
      const result = await PropertyService.updateProperty(id as string, updateData, userId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.message.includes('introuvable') ? 404 : 
                          result.message.includes('autorisé') ? 403 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Erreur dans le contrôleur updateProperty:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

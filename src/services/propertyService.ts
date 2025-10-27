import { Property } from '../models/Proprety';
import {
  IProperty,
  CreatePropertyData,
  UpdatePropertyData,
  PropertySearchFilters,
  PropertyResponse
} from '../types/property';
import logger from '../utils/logger';

export class PropertyService {

  /**
   * Créer une nouvelle propriété
   */
  static async createProperty(data: CreatePropertyData): Promise<PropertyResponse> {
    try {
      const property = new Property(data);
      await property.save();

      logger.info(`Propriété créée avec succès`, { propertyId: property._id, ownerId: data.ownerId });

      return {
        success: true,
        message: 'Propriété créée avec succès',
        property: property.toObject()
      };
    } catch (error) {
      logger.error('Erreur lors de la création de la propriété:', error);
      return {
        success: false,
        message: 'Erreur lors de la création de la propriété'
      };
    }
  }

  /**
   * Récupérer toutes les propriétés avec pagination et filtres
   */
  static async getProperties(
    filters: PropertySearchFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PropertyResponse> {
    try {
      const query: any = { isActive: true };
      
      // Appliquer les filtres
      if (filters.propertyType) {
        query.propertyType = filters.propertyType;
      }
      if (filters.transactionType) {
        query.transactionType = filters.transactionType;
      }
      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = filters.minPrice;
        if (filters.maxPrice) query.price.$lte = filters.maxPrice;
      }
      if (filters.minSurface || filters.maxSurface) {
        query['features.surface'] = {};
        if (filters.minSurface) query['features.surface'].$gte = filters.minSurface;
        if (filters.maxSurface) query['features.surface'].$lte = filters.maxSurface;
      }
      if (filters.minRooms || filters.maxRooms) {
        query['features.rooms'] = {};
        if (filters.minRooms) query['features.rooms'].$gte = filters.minRooms;
        if (filters.maxRooms) query['features.rooms'].$lte = filters.maxRooms;
      }
      if (filters.city) {
        query['location.city'] = new RegExp(filters.city, 'i');
      }
      if (filters.hasParking !== undefined) {
        query['features.hasParking'] = filters.hasParking;
      }
      if (filters.hasGarden !== undefined) {
        query['features.hasGarden'] = filters.hasGarden;
      }
      if (filters.hasPool !== undefined) {
        query['features.hasPool'] = filters.hasPool;
      }
      if (filters.energyClass) {
        query['features.energyClass'] = filters.energyClass;
      }

      const skip = (page - 1) * limit;
      
      const [properties, total] = await Promise.all([
        Property.find(query)
          .populate('ownerId', 'name email phone')
          .sort({ isFeatured: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Property.countDocuments(query)
      ]);

      return {
        success: true,
        message: 'Propriétés récupérées avec succès',
        properties: properties.map(p => p.toObject()),
        total,
        page,
        limit
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des propriétés:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des propriétés'
      };
    }
  }

  /**
   * Mettre à jour une propriété
   */
  static async updateProperty(id: string, data: UpdatePropertyData, userId: string): Promise<PropertyResponse> {
    try {
      const property = await Property.findById(id);
      
      if (!property) {
        return {
          success: false,
          message: 'Propriété introuvable'
        };
      }

      // Vérifier que l'utilisateur est le propriétaire
      if (property.ownerId.toString() !== userId) {
        return {
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier cette propriété'
        };
      }

      Object.assign(property, data);
      await property.save();

      logger.info(`Propriété mise à jour`, { propertyId: id, userId });

      return {
        success: true,
        message: 'Propriété mise à jour avec succès',
        property: property.toObject()
      };
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de la propriété:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour de la propriété'
      };
    }
  }

  
}

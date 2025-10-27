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

}

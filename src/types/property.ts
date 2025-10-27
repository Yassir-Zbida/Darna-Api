import { Document, Types } from 'mongoose';

// Types de transaction
export type TransactionType = 'vente' | 'location_journaliere' | 'location_mensuelle' | 'location_saisonniere';

// Types de bien
export type PropertyType = 'appartement' | 'maison' | 'villa' | 'studio' | 'duplex' | 'penthouse' | 'terrain' | 'commercial';

// Interface pour les coordonnées géographiques
export interface Location {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Interface pour les caractéristiques du bien
export interface PropertyFeatures {
  surface: number; // en m²
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasBalcony?: boolean;
  hasTerrace?: boolean;
  hasPool?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  hasInternet?: boolean;
  hasSecurity?: boolean;
  energyClass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
}

// Interface pour les règles et restrictions
export interface PropertyRules {
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  childrenAllowed?: boolean;
  minimumStay?: number; // en jours
  maximumGuests?: number;
}

// Interface pour les disponibilités (pour les locations)
export interface Availability {
  startDate: Date;
  endDate: Date;
  pricePerDay?: number;
  isAvailable: boolean;
}

// Interface principale de la propriété
export interface IProperty {
  title: string;
  description: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: number;
  pricePerDay?: number; // pour les locations journalières
  currency: string;
  
  // Localisation
  location: Location;
  
  // Caractéristiques
  features: PropertyFeatures;
  
  // Règles et restrictions
  rules?: PropertyRules;
  
  // Disponibilités (pour les locations)
  availability?: Availability[];
  
  // Médias
  images: string[]; // URLs des images
  videos?: string[]; // URLs des vidéos
  
  // Propriétaire
  ownerId: Types.ObjectId; // ID de l'utilisateur propriétaire
  
  // Statut
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean; // Mise en avant
  
  // Métadonnées
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les requêtes de recherche
export interface PropertySearchFilters {
  propertyType?: PropertyType;
  transactionType?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  maxSurface?: number;
  minRooms?: number;
  maxRooms?: number;
  city?: string;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  energyClass?: string;
}

// Interface pour la création d'une propriété
export interface CreatePropertyData {
  title: string;
  description: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: number;
  pricePerDay?: number;
  currency: string;
  location: Location;
  features: PropertyFeatures;
  rules?: PropertyRules;
  availability?: Availability[];
  images: string[];
  videos?: string[];
  ownerId: Types.ObjectId;
}

// Interface pour la mise à jour d'une propriété
export interface UpdatePropertyData {
  title?: string;
  description?: string;
  price?: number;
  pricePerDay?: number;
  location?: Partial<Location>;
  features?: Partial<PropertyFeatures>;
  rules?: Partial<PropertyRules>;
  availability?: Availability[];
  images?: string[];
  videos?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

// Interface pour les réponses API
export interface PropertyResponse {
  success: boolean;
  message: string;
  property?: IProperty;
  properties?: IProperty[];
  total?: number;
  page?: number;
  limit?: number;
}

// Interface pour les erreurs de propriété
export interface PropertyError {
  field: string;
  message: string;
}

// Document Mongoose
export interface PropertyDocument extends IProperty, Document {}

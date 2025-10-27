import mongoose, { Schema } from 'mongoose';
import { IProperty, PropertyDocument } from '../types/property';

const propertySchema = new Schema<PropertyDocument>({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    minlength: [5, 'Le titre doit contenir au moins 5 caractères'],
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    minlength: [20, 'La description doit contenir au moins 20 caractères'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  propertyType: {
    type: String,
    enum: ['appartement', 'maison', 'villa', 'studio', 'duplex', 'penthouse', 'terrain', 'commercial'],
    required: [true, 'Le type de bien est requis']
  },
  transactionType: {
    type: String,
    enum: ['vente', 'location_journaliere', 'location_mensuelle', 'location_saisonniere'],
    required: [true, 'Le type de transaction est requis']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  pricePerDay: {
    type: Number,
    min: [0, 'Le prix par jour ne peut pas être négatif']
  },
  currency: {
    type: String,
    required: [true, 'La devise est requise'],
    default: 'EUR',
    enum: ['EUR', 'USD', 'MAD', 'DZD', 'TND']
  },
  location: {
    address: {
      type: String,
      required: [true, 'L\'adresse est requise'],
      maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
    },
    city: {
      type: String,
      required: [true, 'La ville est requise'],
      maxlength: [50, 'La ville ne peut pas dépasser 50 caractères']
    },
    postalCode: {
      type: String,
      required: [true, 'Le code postal est requis'],
      maxlength: [10, 'Le code postal ne peut pas dépasser 10 caractères']
    },
    country: {
      type: String,
      required: [true, 'Le pays est requis'],
      maxlength: [50, 'Le pays ne peut pas dépasser 50 caractères']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'La latitude est requise'],
        min: [-90, 'La latitude doit être entre -90 et 90'],
        max: [90, 'La latitude doit être entre -90 et 90']
      },
      longitude: {
        type: Number,
        required: [true, 'La longitude est requise'],
        min: [-180, 'La longitude doit être entre -180 et 180'],
        max: [180, 'La longitude doit être entre -180 et 180']
      }
    }
  },
  features: {
    surface: {
      type: Number,
      required: [true, 'La surface est requise'],
      min: [1, 'La surface doit être d\'au moins 1 m²']
    },
    rooms: {
      type: Number,
      required: [true, 'Le nombre de pièces est requis'],
      min: [1, 'Il doit y avoir au moins 1 pièce']
    },
    bedrooms: {
      type: Number,
      required: [true, 'Le nombre de chambres est requis'],
      min: [0, 'Le nombre de chambres ne peut pas être négatif']
    },
    bathrooms: {
      type: Number,
      required: [true, 'Le nombre de salles de bain est requis'],
      min: [0, 'Le nombre de salles de bain ne peut pas être négatif']
    },
    floor: Number,
    hasElevator: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasGarden: { type: Boolean, default: false },
    hasBalcony: { type: Boolean, default: false },
    hasTerrace: { type: Boolean, default: false },
    hasPool: { type: Boolean, default: false },
    hasAirConditioning: { type: Boolean, default: false },
    hasHeating: { type: Boolean, default: false },
    hasInternet: { type: Boolean, default: false },
    hasSecurity: { type: Boolean, default: false },
    energyClass: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    }
  },
  rules: {
    petsAllowed: { type: Boolean, default: true },
    smokingAllowed: { type: Boolean, default: false },
    childrenAllowed: { type: Boolean, default: true },
    minimumStay: { type: Number, min: 1 },
    maximumGuests: { type: Number, min: 1 }
  },
  availability: [{
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pricePerDay: { type: Number, min: 0 },
    isAvailable: { type: Boolean, default: true }
  }],
  images: [{
    type: String,
    required: [true, 'Au moins une image est requise']
  }],
  videos: [String],
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le propriétaire est requis']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour les recherches
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
propertySchema.index({ propertyType: 1, transactionType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ 'features.surface': 1 });
propertySchema.index({ ownerId: 1 });
propertySchema.index({ isActive: 1, isVerified: 1 });

// Index textuel pour la recherche
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text',
  'location.city': 'text'
});

export const Property = mongoose.model<PropertyDocument>('Property', propertySchema);

import mongoose, { Document, Schema } from "mongoose";

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'visiteur' | 'particulier' | 'entreprise' | 'admin';
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  subscriptionType: 'gratuit' | 'pro' | 'premium';
  companyName?: string;
  isKYCVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastLogin?: Date;
  isActive: boolean;
  companyInfo?: {
    siret?: string;
    address?: string;
  };
}

// Modèle User
const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['visiteur', 'particulier', 'entreprise', 'admin'],
    default: 'visiteur'
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscriptionType: {
    type: String,
    enum: ['gratuit', 'pro', 'premium'],
    default: 'gratuit'
  },
  companyName: {
    type: String,
    trim: true
  },
  isKYCVerified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  companyInfo: {
    siret: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Index essentiels
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ subscriptionType: 1 });
userSchema.index({ isVerified: 1 });

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./../types/auth";

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        minlength: [10, "Email doit contenir au moins 10 caractères"],
        maxlength: [30, "Email ne peut pas dépasser 30 caractères"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
        maxlength: [128, "Le mot de passe ne peut pas dépasser 128 caractères"]
    },
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Le nom doit contenir au moins 2 caractères"],
        maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"]
    },
    role: {
        type: String,
        enum: ['visiteur', 'particulier', 'entreprise', 'admin'],
        required: [true, "Role is required"],
        default: 'visiteur'
    },
    phone: { 
        type: String,
        minlength: [10, "Le téléphone doit contenir au moins 10 caractères"],
        maxlength: [13, "Le téléphone ne peut pas dépasser 13 caractères"]
    },
    avatar: { 
        type: String,
        maxlength: [500, "L'URL de l'avatar ne peut pas dépasser 500 caractères"]
    },
    isVerified: { 
        type: Boolean, 
        default: false
    },
    verificationToken: { 
        type: String,
        maxlength: [100, "Le token de vérification ne peut pas dépasser 100 caractères"]
    },
    resetPasswordToken: { 
        type: String,
        maxlength: [100, "Le token de réinitialisation ne peut pas dépasser 100 caractères"]
    },
    resetPasswordExpires: { type: Date },
    subscriptionType: {
        type: String,
        enum: ['gratuit', 'pro', 'premium'],
        default: 'gratuit'
    },
    companyName: { 
        type: String,
        maxlength: [100, "Le nom de l'entreprise ne peut pas dépasser 100 caractères"]
    },
    isKYCVerified: { 
        type: Boolean, 
        default: false 
    },
    twoFactorEnabled: { 
        type: Boolean, 
        default: false 
    },
    lastLogin: { type: Date },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    companyInfo: {
        siret: {
            type: String,
            maxlength: [14, "Le SIRET doit contenir 14 caractères"]
        },
        address: {
            type: String,
            maxlength: [200, "L'adresse ne peut pas dépasser 200 caractères"]
        }
    }
}, {
    timestamps: true,
})

export const User = mongoose.model<UserDocument>("User", userSchema);
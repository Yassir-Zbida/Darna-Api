import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./../types/auth";

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    role: {
        type: String,
        enum: ['visiteur', 'particulier', 'entreprise', 'admin'],
        required: [true, "Role is required"],
        default: 'visiteur'
    },
    phone: { type: String },
    avatar: { type: String },
    isVerified: { 
        type: Boolean, 
        default: false
    },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, {
    timestamps: true,
})

export const User = mongoose.model<UserDocument>("User", userSchema);
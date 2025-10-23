import { User } from "../models/User";
import { RegisterData, AuthResponse } from "../types/auth";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

class AuthService {
    public async register(userData: RegisterData): Promise<AuthResponse> {
        try {
            const isUserExist = await User.findOne({ email: userData.email });
            if (isUserExist) {
                return {
                    success: false,
                    message: "Cet email existe déjà"
                };
            }
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = new User({
                ...userData,
                password: hashedPassword
            });
            
            await newUser.save();

            const token = jwt.sign(
                { userId: (newUser._id as any).toString(), email: newUser.email, role: newUser.role },
                process.env.JWT_SECRET || 'ERREUR: MISSING_JWT_SECRET_ENV_VAR',
                { expiresIn: '7d' }
            );

            return {
                success: true,
                message: "Utilisateur créé avec succès",
                token,
                user: {
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    isVerified: newUser.isVerified,
                    createdAt: newUser.createdAt,
                    updatedAt: newUser.updatedAt
                }
            };
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            return {
                success: false,
                message: "Erreur lors de la création de l'utilisateur"
            };
        }
    }
}

export const authService = new AuthService();
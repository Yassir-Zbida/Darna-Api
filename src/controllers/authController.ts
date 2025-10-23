import { Request, Response } from 'express';
import { authService } from "../services/authService";
import { RegisterData } from "../types/auth";

class AuthController {

    public async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name, phone, role } = req.body;
            const userData: RegisterData = { email, password, name, phone, role };
            const authResponse = await authService.register(userData);
            res.status(authResponse.success ? 201 : 400).json(authResponse);
        } catch (error) {
            console.error('Erreur dans le contrôleur register:', error);
            res.status(500).json({
                success: false,
                message: "Erreur interne du serveur"
            });
        }
    }
}

export default AuthController;
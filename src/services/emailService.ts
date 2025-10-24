import nodemailer from 'nodemailer';
import logger from '../utils/logger';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export class EmailService {
    private static transporter: nodemailer.Transporter;

    /**
     * Initialize email transporter
     */
    static initialize(): void {
        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            logger.info('Email service initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize email service:', error);
            throw error;
        }
    }

    /**
     * Send email
     * @param options - Email options
     * @returns Promise<boolean>
     */
    static async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            if (!this.transporter) {
                this.initialize();
            }

            const mailOptions = {
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text
            };

            const result = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent successfully to ${options.to}`, { messageId: result.messageId });
            return true;

        } catch (error) {
            logger.error(`Failed to send email to ${options.to}:`, error);
            return false;
        }
    }

    /**
     * Send verification email
     * @param email - User email
     * @param name - User name
     * @param verificationToken - Verification token
     * @returns Promise<boolean>
     */
    static async sendVerificationEmail(email: string, name: string, verificationToken: string): Promise<boolean> {
        try {
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
            
            const subject = 'Vérifiez votre adresse email - Darna';
            const html = this.getVerificationEmailTemplate(name, verificationUrl);
            const text = `Bonjour ${name},\n\nVeuillez cliquer sur le lien suivant pour vérifier votre adresse email :\n${verificationUrl}\n\nCe lien expire dans 24 heures.\n\nCordialement,\nL'équipe Darna`;

            return await this.sendEmail({
                to: email,
                subject,
                html,
                text
            });

        } catch (error) {
            logger.error(`Failed to send verification email to ${email}:`, error);
            return false;
        }
    }

    /**
     * Get verification email HTML template
     * @param name - User name
     * @param verificationUrl - Verification URL
     * @returns string - HTML template
     */
    private static getVerificationEmailTemplate(name: string, verificationUrl: string): string {
        return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vérification d'email - Darna</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background-color: #2c3e50;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }
                .content {
                    background-color: #f8f9fa;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                }
                .button {
                    display: inline-block;
                    background-color: #3498db;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Bienvenue sur Darna</h1>
            </div>
            <div class="content">
                <h2>Bonjour ${name},</h2>
                <p>Merci de vous être inscrit sur Darna ! Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Vérifier mon email</a>
                </div>
                
                <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
                
                <p><strong>Important :</strong> Ce lien expire dans 24 heures.</p>
                
                <p>Si vous n'avez pas créé de compte sur Darna, vous pouvez ignorer cet email.</p>
            </div>
            <div class="footer">
                <p>© 2024 Darna. Tous droits réservés.</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Test email configuration
     * @returns Promise<boolean>
     */
    static async testConnection(): Promise<boolean> {
        try {
            if (!this.transporter) {
                this.initialize();
            }

            await this.transporter.verify();
            logger.info('Email service connection test successful');
            return true;

        } catch (error) {
            logger.error('Email service connection test failed:', error);
            return false;
        }
    }
}

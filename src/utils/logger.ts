import fs from 'fs';
import path from 'path';

/**
 * Utilitaire de logging simple pour l'application
 */
class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  /**
   * S'assure que le répertoire de logs existe
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Formate le message de log
   * @param level - Niveau de log
   * @param message - Message à logger
   * @param meta - Métadonnées supplémentaires
   * @returns Message formaté
   */
  private formatMessage(level: string, message: string, meta: any = {}): string {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  /**
   * Écrit dans le fichier de log
   * @param level - Niveau de log
   * @param message - Message à logger
   * @param meta - Métadonnées supplémentaires
   */
  private writeToFile(level: string, message: string, meta: any = {}): void {
    const logFile = path.join(this.logDir, 'app.log');
    const formattedMessage = this.formatMessage(level, message, meta);
    
    fs.appendFileSync(logFile, formattedMessage + '\n');
  }

  /**
   * Log d'information
   * @param message - Message à logger
   * @param meta - Métadonnées supplémentaires
   */
  info(message: string, meta: any = {}): void {
    const formattedMessage = this.formatMessage('info', message, meta);
    console.log(formattedMessage);
    this.writeToFile('info', message, meta);
  }

  /**
   * Log d'avertissement
   * @param message - Message à logger
   * @param meta - Métadonnées supplémentaires
   */
  warn(message: string, meta: any = {}): void {
    const formattedMessage = this.formatMessage('warn', message, meta);
    console.warn(formattedMessage);
    this.writeToFile('warn', message, meta);
  }

  /**
   * Log d'erreur
   * @param message - Message à logger
   * @param meta - Métadonnées supplémentaires
   */
  error(message: string, meta: any = {}): void {
    const formattedMessage = this.formatMessage('error', message, meta);
    console.error(formattedMessage);
    this.writeToFile('error', message, meta);
  }

  /**
   * Log de débogage
   * @param message - Message à logger
   * @param meta - Métadonnées supplémentaires
   */
  debug(message: string, meta: any = {}): void {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage('debug', message, meta);
      console.log(formattedMessage);
      this.writeToFile('debug', message, meta);
    }
  }
}

// Instance singleton
const logger = new Logger();

export default logger;

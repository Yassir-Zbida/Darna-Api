const fs = require('fs');
const path = require('path');

/**
 * Utilitaire de logging simple pour l'application
 */
class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  /**
   * S'assure que le répertoire de logs existe
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Formate le message de log
   * @param {string} level - Niveau de log
   * @param {string} message - Message à logger
   * @param {Object} meta - Métadonnées supplémentaires
   * @returns {string} Message formaté
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  /**
   * Écrit dans le fichier de log
   * @param {string} level - Niveau de log
   * @param {string} message - Message à logger
   * @param {Object} meta - Métadonnées supplémentaires
   */
  writeToFile(level, message, meta = {}) {
    const logFile = path.join(this.logDir, 'app.log');
    const formattedMessage = this.formatMessage(level, message, meta);
    
    fs.appendFileSync(logFile, formattedMessage + '\n');
  }

  /**
   * Log d'information
   * @param {string} message - Message à logger
   * @param {Object} meta - Métadonnées supplémentaires
   */
  info(message, meta = {}) {
    const formattedMessage = this.formatMessage('info', message, meta);
    console.log(formattedMessage);
    this.writeToFile('info', message, meta);
  }

  /**
   * Log d'avertissement
   * @param {string} message - Message à logger
   * @param {Object} meta - Métadonnées supplémentaires
   */
  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage('warn', message, meta);
    console.warn(formattedMessage);
    this.writeToFile('warn', message, meta);
  }

  /**
   * Log d'erreur
   * @param {string} message - Message à logger
   * @param {Object} meta - Métadonnées supplémentaires
   */
  error(message, meta = {}) {
    const formattedMessage = this.formatMessage('error', message, meta);
    console.error(formattedMessage);
    this.writeToFile('error', message, meta);
  }

  /**
   * Log de débogage
   * @param {string} message - Message à logger
   * @param {Object} meta - Métadonnées supplémentaires
   */
  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage('debug', message, meta);
      console.log(formattedMessage);
      this.writeToFile('debug', message, meta);
    }
  }
}

// Instance singleton
const logger = new Logger();

module.exports = logger;

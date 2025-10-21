const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Configuration de la base de données MongoDB
 */
class DatabaseConfig {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Établit la connexion à MongoDB
   * @param {string} uri - URI de connexion MongoDB
   * @param {Object} options - Options de connexion
   */
  async connect(uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/darna', options = {}) {
    try {
      const defaultOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0,
        ...options
      };

      this.connection = await mongoose.connect(uri, defaultOptions);
      this.isConnected = true;

      logger.info('✅ Connexion à MongoDB établie avec succès');
      logger.info(`📊 Base de données: ${this.connection.connection.name}`);
      logger.info(`🌐 Host: ${this.connection.connection.host}:${this.connection.connection.port}`);

      // Gestion des événements de connexion
      this.setupEventHandlers();

      return this.connection;
    } catch (error) {
      this.isConnected = false;
      logger.error('❌ Erreur lors de la connexion à MongoDB:', error);
      throw error;
    }
  }

  /**
   * Configure les gestionnaires d'événements pour la connexion
   */
  setupEventHandlers() {
    if (!this.connection) return;

    // Connexion établie
    mongoose.connection.on('connected', () => {
      logger.info('🟢 MongoDB connecté');
      this.isConnected = true;
    });

    // Connexion perdue
    mongoose.connection.on('disconnected', () => {
      logger.warn('🟡 MongoDB déconnecté');
      this.isConnected = false;
    });

    // Erreur de connexion
    mongoose.connection.on('error', (error) => {
      logger.error('🔴 Erreur MongoDB:', error);
      this.isConnected = false;
    });

    // Fermeture de l'application
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Ferme la connexion à MongoDB
   */
  async disconnect() {
    try {
      if (this.connection && this.isConnected) {
        await mongoose.connection.close();
        this.isConnected = false;
        logger.info('🔌 Connexion MongoDB fermée');
      }
    } catch (error) {
      logger.error('❌ Erreur lors de la fermeture de MongoDB:', error);
      throw error;
    }
  }

  /**
   * Vérifie l'état de la connexion
   * @returns {boolean} True si connecté
   */
  isConnectionActive() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Obtient les informations de connexion
   * @returns {Object} Informations de connexion
   */
  getConnectionInfo() {
    if (!this.connection) return null;

    return {
      host: this.connection.connection.host,
      port: this.connection.connection.port,
      name: this.connection.connection.name,
      readyState: mongoose.connection.readyState,
      isConnected: this.isConnected
    };
  }

  /**
   * Teste la connexion à la base de données
   * @returns {Promise<boolean>} True si le test réussit
   */
  async testConnection() {
    try {
      if (!this.isConnectionActive()) {
        throw new Error('Aucune connexion active');
      }

      // Ping simple pour tester la connexion
      await mongoose.connection.db.admin().ping();
      logger.info('✅ Test de connexion MongoDB réussi');
      return true;
    } catch (error) {
      logger.error('❌ Test de connexion MongoDB échoué:', error);
      return false;
    }
  }
}

// Instance singleton
const databaseConfig = new DatabaseConfig();

module.exports = databaseConfig;

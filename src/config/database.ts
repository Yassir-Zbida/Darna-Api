import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Configuration de la base de données MongoDB
 */
class DatabaseConfig {
  private connection: typeof mongoose | null = null;
  private isConnected: boolean = false;

  /**
   * Établit la connexion à MongoDB
   * @param uri - URI de connexion MongoDB
   * @param options - Options de connexion
   */
  async connect(uri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/darna', options: any = {}): Promise<typeof mongoose> {
    try {
      const defaultOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
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
  private setupEventHandlers(): void {
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
  async disconnect(): Promise<void> {
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
   * @returns True si connecté
   */
  isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Obtient les informations de connexion
   * @returns Informations de connexion
   */
  getConnectionInfo(): any {
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
   * @returns True si le test réussit
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isConnectionActive()) {
        throw new Error('Aucune connexion active');
      }

      // Ping simple pour tester la connexion
      if (!mongoose.connection.db) {
        throw new Error('Base de données non disponible');
      }
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

export default databaseConfig;

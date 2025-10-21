import { Client } from 'minio';
import logger from '../utils/logger';

/**
 * Configuration MinIO pour le stockage des médias
 */
class MinIOConfig {
  private client: Client | null = null;
  private isConnected: boolean = false;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'darna-media';
  }

  /**
   * Initialise le client MinIO
   */
  async initialize(): Promise<void> {
    try {
      const minioConfig = {
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT || '9000', 10),
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
      };

      this.client = new Client(minioConfig);
      this.isConnected = true;

      logger.info('✅ Client MinIO initialisé avec succès');
      logger.info(`📊 Endpoint: ${minioConfig.endPoint}:${minioConfig.port}`);
      logger.info(`🔐 SSL: ${minioConfig.useSSL ? 'Activé' : 'Désactivé'}`);

      // Vérifier la connexion et créer le bucket si nécessaire
      await this.ensureBucketExists();

    } catch (error) {
      this.isConnected = false;
      logger.error('❌ Erreur lors de l\'initialisation de MinIO:', error);
      throw error;
    }
  }

  /**
   * Vérifie si le bucket existe et le crée si nécessaire
   */
  private async ensureBucketExists(): Promise<void> {
    if (!this.client) {
      throw new Error('Client MinIO non initialisé');
    }

    try {
      const bucketExists = await this.client.bucketExists(this.bucketName);
      
      if (!bucketExists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        logger.info(`📦 Bucket '${this.bucketName}' créé avec succès`);
        
        // Configurer la politique du bucket pour l'accès public en lecture
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`]
            }
          ]
        };
        
        await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        logger.info(`🔓 Politique publique configurée pour le bucket '${this.bucketName}'`);
      } else {
        logger.info(`📦 Bucket '${this.bucketName}' existe déjà`);
      }
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification/création du bucket:', error);
      throw error;
    }
  }

  /**
   * Obtient le client MinIO
   * @returns Client MinIO
   */
  getClient(): Client {
    if (!this.client) {
      throw new Error('Client MinIO non initialisé. Appelez initialize() d\'abord.');
    }
    return this.client;
  }

  /**
   * Vérifie si le client est connecté
   * @returns True si connecté
   */
  isConnectionActive(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Obtient le nom du bucket
   * @returns Nom du bucket
   */
  getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Teste la connexion à MinIO
   * @returns True si le test réussit
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isConnectionActive()) {
        throw new Error('Client MinIO non initialisé');
      }

      // Lister les buckets pour tester la connexion
      await this.client!.listBuckets();
      logger.info('✅ Test de connexion MinIO réussi');
      return true;
    } catch (error) {
      logger.error('❌ Test de connexion MinIO échoué:', error);
      return false;
    }
  }

  /**
   * Obtient les informations de connexion
   * @returns Informations de connexion
   */
  getConnectionInfo(): any {
    if (!this.client) return null;

    return {
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      bucketName: this.bucketName,
      isConnected: this.isConnected
    };
  }
}

// Instance singleton
const minioConfig = new MinIOConfig();

export default minioConfig;

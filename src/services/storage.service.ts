import { Client } from 'minio';
import minioConfig from '../config/minio';
import logger from '../utils/logger';
import { Readable } from 'stream';

/**
 * Interface pour les options d'upload
 */
export interface UploadOptions {
  contentType?: string;
  metadata?: { [key: string]: string };
  tags?: { [key: string]: string };
}

/**
 * Interface pour les informations de fichier
 */
export interface FileInfo {
  name: string;
  size: number;
  lastModified: Date;
  etag: string;
  contentType?: string;
  metadata?: { [key: string]: string };
}

/**
 * Service de stockage MinIO pour la gestion des médias
 */
class StorageService {
  private client: Client;
  private bucketName: string;

  constructor() {
    this.client = minioConfig.getClient();
    this.bucketName = minioConfig.getBucketName();
  }

  /**
   * Upload un fichier vers MinIO
   * @param objectName - Nom du fichier dans le bucket
   * @param stream - Stream du fichier à uploader
   * @param options - Options d'upload
   * @returns Promise avec les informations du fichier uploadé
   */
  async uploadFile(
    objectName: string, 
    stream: Readable | Buffer | string, 
    options: UploadOptions = {}
  ): Promise<FileInfo> {
    try {
      if (!minioConfig.isConnectionActive()) {
        throw new Error('Client MinIO non connecté');
      }

      const uploadOptions: any = {};
      
      if (options.contentType) {
        uploadOptions['Content-Type'] = options.contentType;
      }
      
      if (options.metadata) {
        uploadOptions.metadata = options.metadata;
      }

      // Upload du fichier
      const etag = await this.client.putObject(
        this.bucketName,
        objectName,
        stream,
        uploadOptions
      );

      logger.info(`✅ Fichier uploadé avec succès: ${objectName}`);
      logger.info(`📦 ETag: ${etag}`);

      // Récupérer les informations du fichier
      const fileInfo = await this.getFileInfo(objectName);
      return fileInfo;

    } catch (error) {
      logger.error(`❌ Erreur lors de l'upload du fichier ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Télécharge un fichier depuis MinIO
   * @param objectName - Nom du fichier à télécharger
   * @returns Promise avec le stream du fichier
   */
  async downloadFile(objectName: string): Promise<Readable> {
    try {
      if (!minioConfig.isConnectionActive()) {
        throw new Error('Client MinIO non connecté');
      }

      const stream = await this.client.getObject(this.bucketName, objectName);
      logger.info(`✅ Fichier téléchargé avec succès: ${objectName}`);
      
      return stream;

    } catch (error) {
      logger.error(`❌ Erreur lors du téléchargement du fichier ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un fichier de MinIO
   * @param objectName - Nom du fichier à supprimer
   * @returns Promise<void>
   */
  async deleteFile(objectName: string): Promise<void> {
    try {
      if (!minioConfig.isConnectionActive()) {
        throw new Error('Client MinIO non connecté');
      }

      await this.client.removeObject(this.bucketName, objectName);
      logger.info(`✅ Fichier supprimé avec succès: ${objectName}`);

    } catch (error) {
      logger.error(`❌ Erreur lors de la suppression du fichier ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Obtient l'URL publique d'un fichier
   * @param objectName - Nom du fichier
   * @param expires - Durée d'expiration en secondes (par défaut 7 jours)
   * @returns URL publique du fichier
   */
  async getFileURL(objectName: string, expires: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      if (!minioConfig.isConnectionActive()) {
        throw new Error('Client MinIO non connecté');
      }

      const url = await this.client.presignedGetObject(this.bucketName, objectName, expires);
      logger.info(`🔗 URL générée pour: ${objectName}`);
      
      return url;

    } catch (error) {
      logger.error(`❌ Erreur lors de la génération de l'URL pour ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Obtient l'URL publique directe d'un fichier (si le bucket est public)
   * @param objectName - Nom du fichier
   * @returns URL publique directe
   */
  getPublicURL(objectName: string): string {
    const connectionInfo = minioConfig.getConnectionInfo();
    const protocol = connectionInfo.useSSL ? 'https' : 'http';
    const port = connectionInfo.port === 80 || connectionInfo.port === 443 ? '' : `:${connectionInfo.port}`;
    
    return `${protocol}://${connectionInfo.endPoint}${port}/${this.bucketName}/${objectName}`;
  }

  /**
   * Obtient les informations d'un fichier
   * @param objectName - Nom du fichier
   * @returns Informations du fichier
   */
  async getFileInfo(objectName: string): Promise<FileInfo> {
    try {
      if (!minioConfig.isConnectionActive()) {
        throw new Error('Client MinIO non connecté');
      }

      const stat = await this.client.statObject(this.bucketName, objectName);
      
      return {
        name: objectName,
        size: stat.size,
        lastModified: stat.lastModified,
        etag: stat.etag,
        contentType: stat.metaData['content-type'],
        metadata: stat.metaData
      };

    } catch (error) {
      logger.error(`❌ Erreur lors de la récupération des informations du fichier ${objectName}:`, error);
      throw error;
    }
  }

  /**
   * Liste les fichiers dans le bucket
   * @param prefix - Préfixe pour filtrer les fichiers (optionnel)
   * @param recursive - Recherche récursive (par défaut true)
   * @returns Liste des fichiers
   */
  async listFiles(prefix: string = '', recursive: boolean = true): Promise<FileInfo[]> {
    try {
      if (!minioConfig.isConnectionActive()) {
        throw new Error('Client MinIO non connecté');
      }

      const files: FileInfo[] = [];
      const stream = this.client.listObjects(this.bucketName, prefix, recursive);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          files.push({
            name: obj.name || '',
            size: obj.size || 0,
            lastModified: obj.lastModified || new Date(),
            etag: obj.etag || ''
          });
        });

        stream.on('end', () => {
          logger.info(`📋 ${files.length} fichiers trouvés`);
          resolve(files);
        });

        stream.on('error', (error) => {
          logger.error('❌ Erreur lors de la liste des fichiers:', error);
          reject(error);
        });
      });

    } catch (error) {
      logger.error('❌ Erreur lors de la liste des fichiers:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un fichier existe
   * @param objectName - Nom du fichier
   * @returns True si le fichier existe
   */
  async fileExists(objectName: string): Promise<boolean> {
    try {
      await this.getFileInfo(objectName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Copie un fichier dans le même bucket
   * @param sourceObjectName - Nom du fichier source
   * @param destObjectName - Nom du fichier de destination
   * @returns Promise<void>
   */
  async copyFile(sourceObjectName: string, destObjectName: string): Promise<void> {
    try {
      if (!minioConfig.isConnectionActive()) {
        throw new Error('Client MinIO non connecté');
      }

      const copyConditions = {
        'x-amz-copy-source': `${this.bucketName}/${sourceObjectName}`
      };

      await this.client.copyObject(
        this.bucketName,
        destObjectName,
        copyConditions as any
      );

      logger.info(`✅ Fichier copié: ${sourceObjectName} -> ${destObjectName}`);

    } catch (error) {
      logger.error(`❌ Erreur lors de la copie du fichier ${sourceObjectName}:`, error);
      throw error;
    }
  }
}

// Instance singleton
const storageService = new StorageService();

export default storageService;

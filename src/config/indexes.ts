import mongoose from 'mongoose';
import logger from '../utils/logger';

interface IndexDefinition {
  keys: Record<string, any>;
  options?: Record<string, any>;
}

/**
 * Configuration des index de base pour MongoDB
 */
class IndexConfig {
  private indexes: Map<string, IndexDefinition[]> = new Map();
  private initialized: boolean = false;

  /**
   * Définit les index pour une collection
   * @param collectionName - Nom de la collection
   * @param indexDefinitions - Définitions des index
   */
  defineIndexes(collectionName: string, indexDefinitions: IndexDefinition[]): void {
    this.indexes.set(collectionName, indexDefinitions);
    logger.info(`📋 Index définis pour la collection: ${collectionName}`);
  }

  /**
   * Crée tous les index configurés
   */
  async createAllIndexes(): Promise<void> {
    if (this.initialized) {
      logger.info('📋 Index déjà initialisés');
      return;
    }

    try {
      logger.info('🔧 Création des index de base...');

      for (const [collectionName, indexDefinitions] of this.indexes) {
        await this.createIndexesForCollection(collectionName, indexDefinitions);
      }

      this.initialized = true;
      logger.info('✅ Tous les index ont été créés avec succès');
    } catch (error) {
      logger.error('❌ Erreur lors de la création des index:', error);
      throw error;
    }
  }

  /**
   * Crée les index pour une collection spécifique
   * @param collectionName - Nom de la collection
   * @param indexDefinitions - Définitions des index
   */
  async createIndexesForCollection(collectionName: string, indexDefinitions: IndexDefinition[]): Promise<void> {
    try {
      if (!mongoose.connection.db) {
        throw new Error('Base de données non disponible');
      }
      const collection = mongoose.connection.db.collection(collectionName);
      
      for (const indexDef of indexDefinitions) {
        const { keys, options = {} } = indexDef;
        
        try {
          // Vérifier si l'index existe déjà
          const existingIndexes = await collection.indexes();
          const indexExists = existingIndexes.some(index => 
            JSON.stringify(index.key) === JSON.stringify(keys)
          );

          if (!indexExists) {
            await collection.createIndex(keys, options);
            logger.info(`   ✅ Index créé: ${collectionName}.${JSON.stringify(keys)}`);
          } else {
            logger.info(`   ℹ️  Index existe déjà: ${collectionName}.${JSON.stringify(keys)}`);
          }
        } catch (indexError: any) {
          // Si la collection n'existe pas encore, on log mais on continue
          if (indexError.code === 26 || indexError.codeName === 'NamespaceNotFound') {
            logger.info(`   ℹ️  Collection ${collectionName} n'existe pas encore, index sera créé lors du premier insert`);
          } else {
            throw indexError;
          }
        }
      }
    } catch (error) {
      logger.error(`❌ Erreur lors de la création des index pour ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Supprime tous les index (sauf _id_)
   * @param collectionName - Nom de la collection
   */
  async dropIndexes(collectionName: string): Promise<void> {
    try {
      if (!mongoose.connection.db) {
        throw new Error('Base de données non disponible');
      }
      const collection = mongoose.connection.db.collection(collectionName);
      await collection.dropIndexes();
      logger.info(`🗑️  Index supprimés pour: ${collectionName}`);
    } catch (error) {
      logger.error(`❌ Erreur lors de la suppression des index pour ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Liste tous les index d'une collection
   * @param collectionName - Nom de la collection
   * @returns Liste des index
   */
  async listIndexes(collectionName: string): Promise<any[]> {
    try {
      if (!mongoose.connection.db) {
        throw new Error('Base de données non disponible');
      }
      const collection = mongoose.connection.db.collection(collectionName);
      const indexes = await collection.indexes();
      return indexes;
    } catch (error) {
      logger.error(`❌ Erreur lors de la récupération des index pour ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Analyse les performances des index
   * @param collectionName - Nom de la collection
   * @param query - Requête à analyser
   */
  async analyzeQuery(collectionName: string, query: any): Promise<any> {
    try {
      if (!mongoose.connection.db) {
        throw new Error('Base de données non disponible');
      }
      const collection = mongoose.connection.db.collection(collectionName);
      const explainResult = await collection.find(query).explain('executionStats');
      
      logger.info(`📊 Analyse de requête pour ${collectionName}:`);
      logger.info(`   Documents examinés: ${explainResult.executionStats.totalDocsExamined}`);
      logger.info(`   Documents retournés: ${explainResult.executionStats.totalDocsReturned}`);
      logger.info(`   Temps d'exécution: ${explainResult.executionStats.executionTimeMillis}ms`);
      
      return explainResult;
    } catch (error) {
      logger.error(`❌ Erreur lors de l'analyse de requête pour ${collectionName}:`, error);
      throw error;
    }
  }
}

/**
 * Configuration des index de base pour l'application Darna
 */
function configureBaseIndexes(): IndexConfig {
  const indexConfig = new IndexConfig();

  // Index pour la collection des utilisateurs
  indexConfig.defineIndexes('users', [
    {
      keys: { email: 1 },
      options: { unique: true, name: 'email_unique' }
    },
    {
      keys: { phone: 1 },
      options: { unique: true, sparse: true, name: 'phone_unique' }
    },
    {
      keys: { createdAt: -1 },
      options: { name: 'createdAt_desc' }
    },
    {
      keys: { status: 1, role: 1 },
      options: { name: 'status_role' }
    },
    {
      keys: { 'location.coordinates': '2dsphere' },
      options: { name: 'location_geo' }
    }
  ]);

  // Index pour la collection des propriétés
  indexConfig.defineIndexes('properties', [
    {
      keys: { title: 'text', description: 'text' },
      options: { name: 'text_search' }
    },
    {
      keys: { type: 1, status: 1 },
      options: { name: 'type_status' }
    },
    {
      keys: { price: 1 },
      options: { name: 'price_asc' }
    },
    {
      keys: { createdAt: -1 },
      options: { name: 'createdAt_desc' }
    },
    {
      keys: { 'location.coordinates': '2dsphere' },
      options: { name: 'location_geo' }
    },
    {
      keys: { ownerId: 1 },
      options: { name: 'ownerId' }
    },
    {
      keys: { city: 1, district: 1 },
      options: { name: 'city_district' }
    }
  ]);

  // Index pour la collection des messages de chat
  indexConfig.defineIndexes('messages', [
    {
      keys: { conversationId: 1, createdAt: -1 },
      options: { name: 'conversation_time' }
    },
    {
      keys: { senderId: 1 },
      options: { name: 'senderId' }
    },
    {
      keys: { createdAt: -1 },
      options: { name: 'createdAt_desc' }
    },
    {
      keys: { isRead: 1, recipientId: 1 },
      options: { name: 'unread_messages' }
    }
  ]);

  // Index pour la collection des conversations
  indexConfig.defineIndexes('conversations', [
    {
      keys: { participants: 1 },
      options: { name: 'participants' }
    },
    {
      keys: { lastMessageAt: -1 },
      options: { name: 'lastMessage_desc' }
    },
    {
      keys: { propertyId: 1 },
      options: { name: 'propertyId' }
    }
  ]);

  // Index pour la collection des estimations
  indexConfig.defineIndexes('estimations', [
    {
      keys: { propertyId: 1 },
      options: { name: 'propertyId' }
    },
    {
      keys: { createdAt: -1 },
      options: { name: 'createdAt_desc' }
    },
    {
      keys: { estimatedValue: 1 },
      options: { name: 'estimatedValue_asc' }
    },
    {
      keys: { status: 1 },
      options: { name: 'status' }
    }
  ]);

  return indexConfig;
}

// Instance singleton
const indexConfig = configureBaseIndexes();

export default indexConfig;

/**
 * Tests d'intégration pour la configuration des index MongoDB
 */

const indexConfig = require('../../src/config/indexes');
const databaseConfig = require('../../src/config/database');

describe('Index Configuration Integration Tests', () => {
  beforeAll(async () => {
    // Configuration des variables d'environnement pour les tests
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/darna_test';
    process.env.NODE_ENV = 'test';
    
    // Connexion à la base de données
    await databaseConfig.connect();
  });

  afterAll(async () => {
    // Nettoyage après les tests
    await databaseConfig.disconnect();
  });

  describe('Index Creation', () => {
    test('should create all base indexes successfully', async () => {
      await expect(indexConfig.createAllIndexes()).resolves.not.toThrow();
    });

    test('should handle duplicate index creation gracefully', async () => {
      // Créer les index une deuxième fois
      await expect(indexConfig.createAllIndexes()).resolves.not.toThrow();
    });
  });

  describe('Index Management', () => {
    test('should list indexes for a collection', async () => {
      const indexes = await indexConfig.listIndexes('users');
      expect(Array.isArray(indexes)).toBe(true);
    });

    test('should handle non-existent collection gracefully', async () => {
      const indexes = await indexConfig.listIndexes('non_existent_collection');
      expect(Array.isArray(indexes)).toBe(true);
    });
  });

  describe('Index Configuration', () => {
    test('should have defined indexes for all collections', () => {
      // Vérifier que les index sont définis pour les collections principales
      const expectedCollections = ['users', 'properties', 'messages', 'conversations', 'estimations'];
      
      expectedCollections.forEach(collection => {
        expect(indexConfig.indexes.has(collection)).toBe(true);
      });
    });

    test('should have proper index definitions', () => {
      // Vérifier la structure des index pour la collection users
      const userIndexes = indexConfig.indexes.get('users');
      expect(Array.isArray(userIndexes)).toBe(true);
      expect(userIndexes.length).toBeGreaterThan(0);
      
      // Vérifier qu'il y a un index unique sur email
      const emailIndex = userIndexes.find(index => 
        index.keys.email === 1 && index.options.unique === true
      );
      expect(emailIndex).toBeDefined();
    });
  });

  describe('Query Analysis', () => {
    test('should analyze query performance', async () => {
      const result = await indexConfig.analyzeQuery('users', { email: 'test@example.com' });
      expect(result).toBeDefined();
      expect(result.executionStats).toBeDefined();
    });

    test('should handle invalid queries gracefully', async () => {
      await expect(
        indexConfig.analyzeQuery('users', { invalidField: 'value' })
      ).resolves.not.toThrow();
    });
  });
});

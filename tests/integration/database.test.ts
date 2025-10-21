/**
 * Tests d'intégration pour la configuration de base de données MongoDB
 */

import { testMongoDBConnection } from '../../scripts/test-mongodb';

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    // Configuration des variables d'environnement pour les tests
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/darna_test';
    process.env.NODE_ENV = 'test';
  });

  afterAll(async () => {
    // Nettoyage après les tests
    const databaseConfig = require('../../dist/src/config/database').default;
    await databaseConfig.disconnect();
  });

  describe('MongoDB Connection', () => {
    test('should connect to MongoDB successfully', async () => {
      await expect(testMongoDBConnection()).resolves.not.toThrow();
    });

  });

  describe('Database Configuration', () => {
    let databaseConfig: any;

    beforeAll(() => {
      databaseConfig = require('../../dist/src/config/database').default;
    });

    test('should have connection methods', () => {
      expect(databaseConfig.connect).toBeDefined();
      expect(databaseConfig.disconnect).toBeDefined();
      expect(databaseConfig.isConnectionActive).toBeDefined();
      expect(databaseConfig.testConnection).toBeDefined();
    });

    test('should track connection state', () => {
      expect(typeof databaseConfig.isConnectionActive()).toBe('boolean');
    });
  });
});

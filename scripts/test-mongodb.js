#!/usr/bin/env node

/**
 * Script de test pour la connexion MongoDB locale
 * Usage: node scripts/test-mongodb.js
 */

const path = require('path');
const databaseConfig = require('../dist/src/config/database').default;

// Configuration des variables d'environnement
require('dotenv').config();

/**
 * Test de connexion MongoDB
 */
async function testMongoDBConnection() {
  console.log('🧪 Test de connexion MongoDB locale...\n');

  try {
    // Configuration de connexion pour le test
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/darna';
    console.log(`📡 Tentative de connexion à: ${mongoUri}`);

    // Connexion à MongoDB
    await databaseConfig.connect(mongoUri);

    // Test de la connexion
    const isConnected = await databaseConfig.testConnection();
    
    if (isConnected) {
      console.log('\n✅ Test de connexion MongoDB réussi !');
      
      // Affichage des informations de connexion
      const connectionInfo = databaseConfig.getConnectionInfo();
      console.log('\n📊 Informations de connexion:');
      console.log(`   Host: ${connectionInfo.host}`);
      console.log(`   Port: ${connectionInfo.port}`);
      console.log(`   Database: ${connectionInfo.name}`);
      console.log(`   État: ${connectionInfo.readyState === 1 ? 'Connecté' : 'Déconnecté'}`);

      // Test d'opérations de base
      await testBasicOperations();
      
    } else {
      throw new Error('Test de connexion échoué');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors du test de connexion MongoDB:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Suggestions:');
      console.error('   1. Vérifiez que MongoDB est démarré localement');
      console.error('   2. Vérifiez que le port 27017 est disponible');
      console.error('   3. Lancez MongoDB avec: mongod');
    }
    
    process.exit(1);
  } finally {
    // Fermeture de la connexion
    await databaseConfig.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

/**
 * Test d'opérations de base sur MongoDB
 */
async function testBasicOperations() {
  console.log('\n🔧 Test d\'opérations de base...');
  
  try {
    const mongoose = require('mongoose');
    
    // Test de création d'une collection temporaire
    const testCollection = mongoose.connection.db.collection('test_connection');
    
    // Test d'insertion
    const testDoc = {
      message: 'Test de connexion MongoDB',
      timestamp: new Date(),
      testId: Math.random().toString(36).substr(2, 9)
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`   ✅ Insertion réussie (ID: ${insertResult.insertedId})`);
    
    // Test de lecture
    const findResult = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`   ✅ Lecture réussie (document trouvé: ${!!findResult})`);
    
    // Test de mise à jour
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { status: 'tested' } }
    );
    console.log(`   ✅ Mise à jour réussie (${updateResult.modifiedCount} document modifié)`);
    
    // Test de suppression
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log(`   ✅ Suppression réussie (${deleteResult.deletedCount} document supprimé)`);
    
    console.log('\n🎉 Tous les tests d\'opérations de base ont réussi !');
    
  } catch (error) {
    console.error(`   ❌ Erreur lors des tests d'opérations: ${error.message}`);
    throw error;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Darna API - Test de connexion MongoDB\n');
  console.log('=' .repeat(50));
  
  await testMongoDBConnection();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Test terminé avec succès !');
}

// Exécution du script
if (require.main === module) {
  main().catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { testMongoDBConnection, testBasicOperations };

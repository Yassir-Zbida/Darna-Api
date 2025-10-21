#!/usr/bin/env node

/**
 * Script de gestion des index MongoDB
 * Usage: 
 *   node scripts/manage-indexes.js create    - Créer tous les index
 *   node scripts/manage-indexes.js list      - Lister les index
 *   node scripts/manage-indexes.js drop      - Supprimer les index
 *   node scripts/manage-indexes.js analyze   - Analyser les performances
 */

const path = require('path');
const databaseConfig = require('../src/config/database');
const indexConfig = require('../src/config/indexes');

// Configuration des variables d'environnement
require('dotenv').config();

/**
 * Affiche l'aide du script
 */
function showHelp() {
  console.log(`
🔧 Script de gestion des index MongoDB

Usage:
  node scripts/manage-indexes.js <command> [options]

Commands:
  create     Créer tous les index de base
  list       Lister les index d'une collection
  drop       Supprimer les index d'une collection
  analyze    Analyser les performances d'une requête
  help       Afficher cette aide

Examples:
  node scripts/manage-indexes.js create
  node scripts/manage-indexes.js list users
  node scripts/manage-indexes.js drop properties
  node scripts/manage-indexes.js analyze users '{"email": "test@example.com"}'
`);
}

/**
 * Crée tous les index
 */
async function createIndexes() {
  console.log('🔧 Création des index de base...\n');
  
  try {
    await databaseConfig.connect();
    await indexConfig.createAllIndexes();
    console.log('\n✅ Tous les index ont été créés avec succès !');
  } catch (error) {
    console.error('\n❌ Erreur lors de la création des index:', error.message);
    process.exit(1);
  } finally {
    await databaseConfig.disconnect();
  }
}

/**
 * Liste les index d'une collection
 */
async function listIndexes(collectionName) {
  if (!collectionName) {
    console.error('❌ Nom de collection requis');
    console.log('Usage: node scripts/manage-indexes.js list <collection>');
    process.exit(1);
  }

  console.log(`📋 Index de la collection: ${collectionName}\n`);
  
  try {
    await databaseConfig.connect();
    const indexes = await indexConfig.listIndexes(collectionName);
    
    if (indexes.length === 0) {
      console.log('   Aucun index trouvé');
    } else {
      indexes.forEach((index, i) => {
        console.log(`   ${i + 1}. ${index.name}`);
        console.log(`      Clés: ${JSON.stringify(index.key)}`);
        if (index.unique) console.log(`      Unique: ${index.unique}`);
        if (index.sparse) console.log(`      Sparse: ${index.sparse}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('\n❌ Erreur lors de la récupération des index:', error.message);
    process.exit(1);
  } finally {
    await databaseConfig.disconnect();
  }
}

/**
 * Supprime les index d'une collection
 */
async function dropIndexes(collectionName) {
  if (!collectionName) {
    console.error('❌ Nom de collection requis');
    console.log('Usage: node scripts/manage-indexes.js drop <collection>');
    process.exit(1);
  }

  console.log(`🗑️  Suppression des index de la collection: ${collectionName}\n`);
  
  try {
    await databaseConfig.connect();
    await indexConfig.dropIndexes(collectionName);
    console.log('\n✅ Index supprimés avec succès !');
  } catch (error) {
    console.error('\n❌ Erreur lors de la suppression des index:', error.message);
    process.exit(1);
  } finally {
    await databaseConfig.disconnect();
  }
}

/**
 * Analyse les performances d'une requête
 */
async function analyzeQuery(collectionName, queryString) {
  if (!collectionName || !queryString) {
    console.error('❌ Nom de collection et requête requis');
    console.log('Usage: node scripts/manage-indexes.js analyze <collection> \'<query>\'');
    process.exit(1);
  }

  console.log(`📊 Analyse de requête pour: ${collectionName}\n`);
  
  try {
    await databaseConfig.connect();
    
    let query;
    try {
      query = JSON.parse(queryString);
    } catch (error) {
      console.error('❌ Requête JSON invalide:', error.message);
      process.exit(1);
    }
    
    const result = await indexConfig.analyzeQuery(collectionName, query);
    
    console.log('📈 Résultats de l\'analyse:');
    console.log(`   Documents examinés: ${result.executionStats.totalDocsExamined}`);
    console.log(`   Documents retournés: ${result.executionStats.totalDocsReturned}`);
    console.log(`   Temps d'exécution: ${result.executionStats.executionTimeMillis}ms`);
    console.log(`   Index utilisé: ${result.executionStats.executionStages.indexName || 'Aucun'}`);
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'analyse:', error.message);
    process.exit(1);
  } finally {
    await databaseConfig.disconnect();
  }
}

/**
 * Fonction principale
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const collectionName = args[1];
  const queryString = args[2];

  console.log('🚀 Darna API - Gestion des index MongoDB\n');
  console.log('=' .repeat(50));

  switch (command) {
    case 'create':
      await createIndexes();
      break;
    case 'list':
      await listIndexes(collectionName);
      break;
    case 'drop':
      await dropIndexes(collectionName);
      break;
    case 'analyze':
      await analyzeQuery(collectionName, queryString);
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error('❌ Commande inconnue:', command);
      showHelp();
      process.exit(1);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Opération terminée !');
}

// Exécution du script
if (require.main === module) {
  main().catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { createIndexes, listIndexes, dropIndexes, analyzeQuery };

// Script d'initialisation MongoDB pour Darna API
// Ce script s'exécute automatiquement lors du premier démarrage du conteneur MongoDB

// Créer la base de données darna
db = db.getSiblingDB('darna');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'darna_user',
  pwd: 'darna_password',
  roles: [
    {
      role: 'readWrite',
      db: 'darna'
    }
  ]
});

// Créer des collections de base
db.createCollection('users');
db.createCollection('properties');
db.createCollection('chats');
db.createCollection('estimations');

// Ajouter des index pour optimiser les performances
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "createdAt": 1 });

db.properties.createIndex({ "location": "2dsphere" });
db.properties.createIndex({ "price": 1 });
db.properties.createIndex({ "type": 1 });
db.properties.createIndex({ "status": 1 });
db.properties.createIndex({ "createdAt": 1 });

db.chats.createIndex({ "participants": 1 });
db.chats.createIndex({ "lastMessageAt": 1 });

db.estimations.createIndex({ "propertyId": 1 });
db.estimations.createIndex({ "createdAt": 1 });

print('✅ Base de données Darna initialisée avec succès');
print('📊 Collections créées: users, properties, chats, estimations');
print('🔍 Index créés pour optimiser les performances');

# 🏠 Darna - Plateforme Immobilière Intelligente

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🔧 Outils de Qualité de Code

[![ESLint](https://img.shields.io/badge/ESLint-9.x-4B32C3.svg)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.x-F7B93E.svg)](https://prettier.io/)
[![Husky](https://img.shields.io/badge/Husky-9.x-42B883.svg)](https://typicode.github.io/husky/)
[![lint-staged](https://img.shields.io/badge/lint--staged-16.x-00D4AA.svg)](https://github.com/okonet/lint-staged)
[![EditorConfig](https://img.shields.io/badge/EditorConfig-✓-blue.svg)](https://editorconfig.org/)

## 📋 Description

**Darna** est une plateforme immobilière complète qui révolutionne la gestion des annonces immobilières. Notre système intègre des fonctionnalités avancées pour offrir une expérience utilisateur optimale et des outils puissants pour les professionnels de l'immobilier.

### 🌟 Fonctionnalités Principales

- **📱 Gestion Multi-Média** : Upload et gestion optimisée d'images et vidéos
- **💳 Système d'Abonnements** : Plans flexibles pour agents et agences
- **⭐ Affichage Prioritaire** : Mise en avant des annonces premium
- **💬 Chat Temps Réel** : Communication instantanée entre acheteurs et vendeurs
- **💰 Estimation Intelligente** : IA pour l'estimation automatique des prix
- **🔍 Recherche Avancée** : Filtres intelligents et géolocalisation
- **📊 Analytics** : Tableaux de bord complets pour le suivi des performances

## 🚀 Technologies

### Backend

- **Node.js 18+** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB + Mongoose** - Base de données NoSQL
- **Socket.IO** - Communication temps réel
- **JWT** - Authentification sécurisée
- **Multer** - Gestion des uploads
- **MinIO** - Stockage d'objets

### DevOps & Testing

- **Docker** - Containerisation
- **Jest** - Framework de tests
- **ESLint** - Linting du code
- **Prettier** - Formatage du code

### 🔧 Outils de Qualité de Code

- **ESLint** - Analyse statique du code TypeScript/JavaScript
- **Prettier** - Formatage automatique du code
- **Husky** - Git hooks pour la qualité du code
- **lint-staged** - Exécution des outils de qualité sur les fichiers stagés
- **EditorConfig** - Configuration uniforme des éditeurs

## 📦 Installation

### Prérequis

- Node.js 18+
- MongoDB 6+
- Docker (optionnel)
- Git

### Installation Locale

```bash
# Cloner le repository
git clone https://github.com/Yassir-Zbida/Darna-Api.git
cd Darna-Api

# Installer les dépendances
npm install

# Configuration de l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Démarrer MongoDB (si pas en Docker)
# Sur macOS avec Homebrew
brew services start mongodb-community

# Démarrer l'application
npm run dev
```

### Installation avec Docker

```bash
# Cloner et configurer
git clone https://github.com/Yassir-Zbida/Darna-Api.git
cd Darna-Api
cp .env.example .env

# Démarrer les services
docker-compose up -d

# L'API sera disponible sur http://localhost:3000
```

## 🐳 Docker & Docker Compose

### Services Inclus

Le projet inclut une configuration Docker complète avec les services suivants :

- **API** : Application Node.js (Port 3000)
- **MongoDB** : Base de données (Port 27017)
- **Redis** : Cache et sessions (Port 6379)
- **MinIO** : Stockage d'objets (Ports 9000, 9001)
- **Nginx** : Reverse proxy (Ports 80, 443) - Optionnel

### Commandes Docker Essentielles

#### 🚀 Démarrage des Services

```bash
# Démarrer tous les services
docker-compose up -d

# Démarrer avec logs en temps réel
docker-compose up

# Démarrer seulement les services de base (sans Nginx)
docker-compose up -d mongodb redis minio api
```

#### 🔧 Gestion des Services

```bash
# Vérifier le statut des services
docker-compose ps

# Voir les logs de tous les services
docker-compose logs

# Voir les logs d'un service spécifique
docker-compose logs api
docker-compose logs mongodb

# Redémarrer un service
docker-compose restart api

# Redémarrer tous les services
docker-compose restart
```

#### 🛠️ Développement

```bash
# Reconstruire l'image API après modifications
docker-compose build api

# Reconstruire et redémarrer
docker-compose up -d --build api

# Accéder au shell du conteneur API
docker-compose exec api sh

# Exécuter des commandes dans le conteneur
docker-compose exec api npm run test
docker-compose exec api npm run lint
```

#### 🧪 Tests et Validation

```bash
# Tester la connexion à l'API
curl http://localhost:3000/health

# Tester MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Tester Redis
docker-compose exec redis redis-cli ping

# Tester MinIO
curl http://localhost:9000/minio/health/live
```

#### 🧹 Nettoyage

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Supprimer les images
docker-compose down --rmi all

# Nettoyage complet (images, volumes, réseaux)
docker system prune -a
```

### Configuration Docker

#### Variables d'Environnement Docker

```env
# API Configuration
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=mongodb://admin:password123@mongodb:27017/darna?authSource=admin

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=darna-media
```

#### Volumes Docker

- `mongodb_data` : Données MongoDB persistantes
- `redis_data` : Données Redis persistantes
- `minio_data` : Fichiers MinIO persistants
- `./logs` : Logs de l'application (bind mount)
- `./uploads` : Fichiers uploadés (bind mount)

#### Réseau Docker

- **Réseau** : `darna-network` (172.20.0.0/16)
- **Communication** : Tous les services communiquent via le réseau interne

### Health Checks

Tous les services incluent des health checks automatiques :

```bash
# Vérifier l'état de santé
docker-compose ps

# Les services doivent afficher "healthy" pour :
# - mongodb
# - redis
# - minio
# - api
```

### Production avec Nginx

Pour déployer en production avec Nginx :

```bash
# Démarrer avec le profil production
docker-compose --profile production up -d

# Cela inclura Nginx comme reverse proxy
```

### Dépannage Docker

#### Problèmes Courants

1. **Port déjà utilisé** :

   ```bash
   # Vérifier les ports utilisés
   lsof -i :3000
   lsof -i :27017
   ```

2. **Services non démarrés** :

   ```bash
   # Vérifier les logs
   docker-compose logs

   # Redémarrer les services
   docker-compose restart
   ```

3. **Problèmes de permissions** :
   ```bash
   # Vérifier les permissions des volumes
   ls -la logs/
   ls -la uploads/
   ```

#### Commandes de Debug

```bash
# Inspecter un conteneur
docker inspect darna-api

# Voir les ressources utilisées
docker stats

# Voir les réseaux Docker
docker network ls

# Voir les volumes Docker
docker volume ls
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests d'intégration
npm run test:integration
```

## 📚 Documentation

- [🏗️ Architecture](docs/ARCHITECTURE.md) - Architecture du système
- [🔌 API Documentation](docs/API.md) - Documentation complète de l'API
- [🧪 Testing Guide](docs/TESTING.md) - Guide de tests
- [🚀 Deployment](docs/DEPLOYMENT.md) - Guide de déploiement
- [🤝 Contributing](CONTRIBUTING.md) - Guide de contribution

## 🛠️ Scripts Disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement
npm run build      # Build de production
npm test           # Lancer les tests
npm run lint       # Vérifier le code
npm run format     # Formater le code
```

## 🌐 API Endpoints

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Annonces

- `GET /api/announcements` - Liste des annonces
- `POST /api/announcements` - Créer une annonce
- `GET /api/announcements/:id` - Détails d'une annonce
- `PUT /api/announcements/:id` - Modifier une annonce

### Chat

- `GET /api/chat/rooms` - Liste des conversations
- `POST /api/chat/messages` - Envoyer un message

## 🔧 Configuration

### Variables d'Environnement

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/darna
DB_NAME=darna

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# MinIO (Stockage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Server
PORT=3000
NODE_ENV=development
```

## 👥 Équipe

- **Yassir Zbida** - Développeur Principal
- [Autres membres de l'équipe]

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou support :

- 📧 Email : support@darna.com
- 🐛 Issues : [GitHub Issues](https://github.com/Yassir-Zbida/Darna-Api/issues)
- 📖 Documentation : [Wiki](https://github.com/Yassir-Zbida/Darna-Api/wiki)

---

<div align="center">
  <p>Fait avec ❤️ par l'équipe Darna</p>
  <p>© 2024 Darna. Tous droits réservés.</p>
</div>

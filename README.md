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
# Développement
npm run dev                    # Démarrer en mode développement
npm run dev:watch            # Démarrer avec rechargement automatique
npm run dev:debug             # Démarrer en mode debug

# Production
npm start                     # Démarrer en production
npm run build                # Compiler TypeScript vers JavaScript
npm run build:watch          # Compiler en mode watch
npm run build:clean          # Nettoyer et compiler

# Qualité de Code
npm run lint                  # Vérifier le code avec ESLint
npm run lint:fix             # Corriger automatiquement les erreurs ESLint
npm run format               # Formater le code avec Prettier
npm run format:check         # Vérifier le formatage

# Tests
npm test                     # Lancer tous les tests
npm run test:watch           # Tests en mode watch
npm run test:coverage        # Tests avec couverture
npm run test:integration     # Tests d'intégration

# Base de données
npm run db:seed              # Peupler la base de données
npm run db:migrate           # Exécuter les migrations
npm run db:reset             # Réinitialiser la base de données
npm run db:test              # Tester la connexion MongoDB

# Stockage
npm run minio:test           # Tester la connexion MinIO

# Docker
npm run docker:build         # Construire l'image Docker
npm run docker:run           # Exécuter le conteneur
npm run docker:compose:up    # Démarrer avec Docker Compose
npm run docker:compose:down  # Arrêter Docker Compose
npm run docker:compose:logs  # Voir les logs Docker

# PM2 (Process Manager)
npm run pm2:start            # Démarrer avec PM2
npm run pm2:stop             # Arrêter PM2
npm run pm2:restart          # Redémarrer PM2
npm run pm2:delete           # Supprimer le processus PM2
npm run pm2:logs             # Voir les logs PM2
npm run pm2:monit            # Monitoring PM2

# Utilitaires
npm run clean                # Nettoyer node_modules
npm run install:clean        # Installation propre
npm run logs                 # Voir les logs de l'application
npm run health               # Vérifier la santé de l'API
```

## 🌐 API Endpoints

### Authentification

- `POST /api/v1/auth/register` - Inscription utilisateur
- `POST /api/v1/auth/login` - Connexion utilisateur
- `POST /api/v1/auth/refresh` - Rafraîchir le token JWT
- `POST /api/v1/auth/logout` - Déconnexion
- `POST /api/v1/auth/forgot-password` - Mot de passe oublié
- `POST /api/v1/auth/reset-password` - Réinitialiser le mot de passe
- `GET /api/v1/auth/profile` - Profil utilisateur
- `PUT /api/v1/auth/profile` - Modifier le profil

### Annonces Immobilières

- `GET /api/v1/announcements` - Liste des annonces avec filtres
- `POST /api/v1/announcements` - Créer une nouvelle annonce
- `GET /api/v1/announcements/:id` - Détails d'une annonce
- `PUT /api/v1/announcements/:id` - Modifier une annonce
- `DELETE /api/v1/announcements/:id` - Supprimer une annonce
- `POST /api/v1/announcements/:id/images` - Upload d'images
- `POST /api/v1/announcements/:id/videos` - Upload de vidéos
- `GET /api/v1/announcements/search` - Recherche avancée
- `GET /api/v1/announcements/featured` - Annonces mises en avant

### Chat & Messagerie

- `GET /api/v1/chat/rooms` - Liste des conversations
- `POST /api/v1/chat/rooms` - Créer une conversation
- `GET /api/v1/chat/rooms/:id/messages` - Messages d'une conversation
- `POST /api/v1/chat/messages` - Envoyer un message
- `PUT /api/v1/chat/messages/:id` - Modifier un message
- `DELETE /api/v1/chat/messages/:id` - Supprimer un message

### Estimation & IA

- `POST /api/v1/estimation/analyze` - Analyse d'une propriété
- `GET /api/v1/estimation/history` - Historique des estimations
- `POST /api/v1/estimation/feedback` - Feedback sur l'estimation

### Gestion des Fichiers

- `POST /api/v1/upload/images` - Upload d'images
- `POST /api/v1/upload/videos` - Upload de vidéos
- `DELETE /api/v1/upload/:id` - Supprimer un fichier
- `GET /api/v1/upload/:id` - Télécharger un fichier

## 🔧 Configuration

### Variables d'Environnement

```env
# Base de données
MONGODB_URI=mongodb://admin:password123@localhost:27017/darna?authSource=admin
DB_NAME=darna

# JWT
JWT_SECRET=darna-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# MinIO (Stockage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=darna-media

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Server
PORT=3000
NODE_ENV=development
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/avi
```

## 👥 Équipe

- **Yassir Zbida** - Développeur Principal & Architecte
- **Abderrahmane AHLALLAY** - Développeur Backend & DevOps
- **Youcode Students** - Équipe de développement

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

- 📧 Email : support@darna.ma
- 🐛 Issues : [GitHub Issues](https://github.com/Yassir-Zbida/Darna-Api/issues)
- 📖 Documentation : [Wiki](https://github.com/Yassir-Zbida/Darna-Api/wiki)
- 💬 Discord : [Darna Community](https://discord.gg/darna)
- 📱 WhatsApp : +212 6XX-XXXXXX
- 🌐 Site Web : [www.darna.ma](https://www.darna.ma)

---

<div align="center">
  <p>Fait avec ❤️ par Youcode Students</p>
  <p>© 2025 Darna. Tous droits réservés.</p>
</div>

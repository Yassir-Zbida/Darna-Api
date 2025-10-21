<div align="center">
# 🏠 Darna - Plateforme Immobilière Intelligente

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-3.x-blue.svg)](https://www.docker.com/)
</div>

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

## 🧪 Tests

```bash
npm test                  # Tests unitaires
npm run test:watch        # Tests en mode watch
npm run test:coverage     # Tests avec couverture
npm run test:integration  # Tests d'intégration
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
- **Abderrahmane Ahlallay** - Collaborateur

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

<div align="center">
  <p>Fait avec ❤️ par l'équipe Darna</p>
  <p>Darna © 2025 Tous droits réservés.</p>
</div>
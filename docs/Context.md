<div align="center">

# 🏠 Darna - Plateforme intelligente d'annonces, de chat et d'estimation immobilière

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-3.x-blue.svg)](https://www.docker.com/)

**👤 Assigné :** Zakaria Ziane  
**📅 Créé :** 19/10/25

</div>

## 📋 Description du projet

Darna est un système de gestion d'annonces immobilières intégrant media, abonnements, affichage prioritaire, chat temps réel et estimation de prix.

> **⚠️ Ce brief vous a été assigné.**  
> Lisez attentivement votre brief avant de débuter votre travail !

## ℹ️ Informations générales

- **👥 Assignation de groupe** : Vous travaillez en groupe sur ce brief.
- **💼 Situation professionnelle** : Développement d'APIs REST sécurisés avec Node.js & Express

## 🎯 Besoin visé ou problème rencontré

Mise en place d'une application web de gestion de données, incluant des fonctionnalités de création, consultation, modification et suppression avec authentification et gestion des accès. Le problème rencontré est l'absence d'un système fiable et sécurisé pour :

- 🗄️ Gérer les données côté serveur
- 🔗 Assurer la communication entre le front-end et le back-end via des APIs REST
- 🔒 Garantir la sécurité des données (authentification, autorisation)
- 🚀 Déployer une solution stable et maintenable

## 🎓 Compétences visées

| Compétence | Description | Niveau |
|------------|-------------|---------|
| 📋 C1 | Planifier le travail à effectuer individuellement | niveau 2, adapter |
| 👥 C2 | Contribuer au pilotage de l'organisation du travail individuel et collectif | niveau 2, adapter |
| 🔍 C3 | Définir le périmètre d'un problème rencontré en adoptant une démarche inductive | niveau 1, imiter |
| 🔎 C4 | Rechercher de façon méthodique une ou des solutions au problème rencontré | niveau 1, imiter |
| 📚 C5 | Partager la solution adoptée en utilisant les moyens de partage de connaissance ou de documentation disponibles | niveau 1, imiter |
| 📊 C6 | Présenter un travail réalisé en synthétisant ses résultats, sa démarche | niveau 2, adapter |
| 🏢 C7 | Se familiariser avec les codes et la culture propres à son environnement professionnel | niveau 1, imiter |
| ⚙️ C8 | Installer et configurer son environnement de travail en fonction du projet | niveau 2, adapter |
| 💻 C9 | Développer des composants métier | niveau 2, adapter |
| 📈 C10 | Contribuer à la gestion d'un projet | niveau 2, adapter |
| 🏗️ C11 | Définir l'architecture logicielle d'une application | niveau 2, adapter |
| 🗄️ C12 | Concevoir et mettre en place une base de données | niveau 2, adapter |
| 🔌 C13 | Développer des composants d'accès aux données | niveau 2, adapter |
| 🧪 C14 | Préparer et exécuter les plans de tests | niveau 1, imiter |
| 🚀 C15 | Contribuer à la mise en production dans une démarche DevOps | niveau 1, imiter |

## 🌟 Contexte du projet

Le projet vise à concevoir et développer une plateforme web moderne de gestion et de publication d'annonces immobilières, destinée aussi bien aux particuliers qu'aux entreprises (agences, promoteurs).

Cette solution se veut scalable, sécurisée et intelligente, exploitant les technologies récentes de l'écosystème Node.js afin de garantir performance, modularité et évolutivité.

## ⚡ Fonctionnalités principales de l'API

- **🏠 Gestion complète des biens immobiliers** : mise en ligne, modification, publication et promotion de biens destinés à la vente, à la location journalière, mensuelle ou longue durée.
- **👥 Comptes et abonnements différenciés** : profils Particulier ou Entreprise (gratuit, pro, premium) influençant la visibilité et la priorité d'affichage.
- **📸 Stockage de médias** : hébergement des images et vidéos sur un service MinIO, avec génération automatique de vignettes.
- **💬 Communication en temps réel** : intégration d'un chat WebSocket et d'un système de notifications instantanées.
- **💰 Pistes de financement** : présentation de banques partenaires et simulateur de crédit immobilier.
- **🤖 Estimation de prix intelligente (LLM)** : calcul automatique d'un intervalle de prix recommandé pour la vente ou la location, basé sur l'analyse des caractéristiques du bien.

## 🏠 Gestion des biens immobiliers

Chaque bien immobilier est décrit par un ensemble complet de métadonnées :

### 📝 Informations générales
- 📄 Titre, description
- 🏷️ Type de transaction (vente, location journalière, mensuelle ou saisonnière)
- 💰 Prix (ou prix par jour)
- 📅 Disponibilités

### 📍 Localisation
- 🏠 Adresse complète
- 🗺️ Coordonnées géographiques (latitude/longitude)

### 🔧 Caractéristiques
- 📐 Surface totale
- 📏 Dimensions des pièces
- 🛏️ Nombre de chambres et salles de bain
- ⚡ Équipements (wifi, climatisation, parking, etc.)
- 📋 Règles internes (animaux, fumeurs, etc.)
- 🔋 Diagnostics énergétiques

## 🔒 Sécurité et conformité

### 🔐 Authentification et comptes
- 📧 Connexion par email/mot de passe
- 🔗 Prise en charge du mode SSO via OAuth
- ✅ Vérification d'adresse email
- 🔐 Authentification à deux facteurs (2FA) en option

### 🛡️ Protection des données
- 🔒 Respect des bonnes pratiques de sécurité
- 📋 Conformité aux normes RGPD (confidentialité, droit à l'oubli, consentement explicite)

## 👥 Rôles & profils

| Rôle | Fonctionnalités |
|------|-----------------|
| 👀 Visiteur | 🔍 Recherche, consultation d'annonces |
| 👤 Particulier | 🏠 Création/gestion de biens, 💬 messagerie, 📋 souscription, 🔔 notifications |
| 🏢 Entreprise (Agence/Promoteur) | 🏠 Multi-biens, 👥 multi-utilisateurs (sous-comptes), 🛠️ outils pro, 📊 statistiques |
| 👑 Admin | 🛡️ Modération, 💳 gestion plans, ✅ vérifications KYC/entreprise, ⚙️ paramètres système |

## 🔔 Système de notifications

Les notifications sont disponibles en temps réel (in-app via WebSocket) et par email.

### ⚡ Événements déclencheurs
- 📨 Réception d'un nouveau lead ou message
- ⏰ Expiration d'un abonnement
- ✅ Validation, rejet ou suppression d'une annonce

## 💬 Messagerie en temps réel

Une messagerie instantanée est intégrée grâce à WebSocket (Socket.IO ou ws), offrant :

- 🟢 Statut de présence en ligne
- 👁️ Indicateur de lecture des messages
- 📎 Envoi de pièces jointes (images, documents)

## 🎯 Gestion des leads et intérêts

Lorsqu'un utilisateur manifeste un intérêt pour un bien, le système crée automatiquement un lead :

- 🔔 Le vendeur reçoit une notification en temps réel
- 💬 Un canal de discussion dédié (thread chat) est ouvert entre les deux parties pour faciliter la communication directe

## 🔍 Recherche et filtrage

Les utilisateurs peuvent effectuer une recherche multi-critères sur les annonces :

- 🔤 Mots-clés, 📍 localisation (avec rayon de recherche)
- 💰 Fourchettes de prix, 📐 surface, 🛏️ nombre de pièces
- ⚡ Équipements, 🏷️ type de transaction, etc.

Les résultats peuvent être triés selon plusieurs critères : 🎯 pertinence, ⭐ priorité, 🕒 récence ou 💰 prix.

### 🧠 Un algorithme d'affichage prioritaire

## 👑 Espace administrateur

L'administrateur dispose d'un tableau de bord complet lui permettant :

- 🛡️ La modération des annonces et signalements
- 💳 La gestion des plans et tarifs d'abonnement
- ✅ La validation des comptes entreprises
- 📊 La consultation de statistiques globales (utilisateurs, revenus, activité)

## 💰 Options de financement

Présentant les banques partenaires avec leurs taux indicatifs et un simulateur simplifié de crédit immobilier, le module intègre également une interopérabilité avec la plateforme Tirelire (Daret l Darna), permettant la simulation et la proposition de création de groupes d'épargne collective destinés au financement de l'achat immobilier.

## 📚 Modalités pédagogiques

- **👥 Travail en groupe**

## ⏰ Date Limite

> **🚨 31/10/2025 à minuit**

## 📝 Modalités d'évaluation

Une durée de **45 min** organisée comme suit :

| ⏱️ Durée | 🎯 Activité |
|-------|----------|
| ⏰ 10 minutes | 🎬 Démontrer le contenu et la fonctionnalité (en groupe) |
| ⏰ 10 minutes | 💻 Montrer le code source et expliquer brièvement comment il fonctionne |
| ⏰ 10 minutes | ❓ Questions/Réponses |
| ⏰ 15 minutes | 👤 Mise en situation individuelle |

## 📦 Livrables

- **💻 Code Source** : Lien GitHub de l'application
- **📋 Planification** : Lien de la planification JIRA
- **📚 Documentation Technique** : Description de l'application dans un fichier README
- **📊 Rapport de coverage** : Plus de 80%

## 🎯 Critères de performance

- **🏗️ Implémentation en utilisant l'OOP** afin de garantir une extensibilité optimale de la solution
- **🌐 Utilisation du module HTTP recommandée** (Express peut également être utilisé)
- **🗄️ Base de données** : MongoDB (Utilisant ODM mongoose ou autre)
- **📋 Planification sur JIRA** : inclure l'utilisation des epics, user stories / tasks et sub-tasks, relier JIRA avec GitHub et mettre en place des règles d'automatisation
- **🔐 Authentification** : sécuriser les données avec JWT, avec un middleware correctement implémenté
- **⚠️ Gestion des exceptions et des erreurs**
- **✅ Validation des données côté backend**
- **🏗️ Architecture n-tiers structurée**
- **📝 Respect des conventions de nommage**
- **🧪 Tests des services avec Jest**
- **🐳 Dockerisation du projet**
- **⚙️ GitHub Actions ou Jenkins CI/CD configuration du PM2**
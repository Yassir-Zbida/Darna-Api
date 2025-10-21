# Configuration MinIO pour le stockage

## Vue d'ensemble

Ce document décrit la configuration et l'utilisation de MinIO pour le stockage des médias dans l'application Darna API. MinIO est utilisé pour stocker les images, vidéos et autres fichiers multimédias de manière sécurisée et scalable.

## Configuration

### Variables d'environnement

Ajoutez les variables suivantes à votre fichier `.env` :

```env
# Configuration MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=darna-media
```

### Configuration de production

Pour la production, utilisez des valeurs sécurisées :

```env
MINIO_ENDPOINT=your-minio-server.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-secure-access-key
MINIO_SECRET_KEY=your-secure-secret-key
MINIO_BUCKET_NAME=darna-media-prod
```

## Installation et démarrage

### 1. Installation des dépendances

```bash
npm install minio
npm install @types/minio
```

### 2. Démarrage de MinIO (Docker)

```bash
# Démarrage avec Docker Compose
docker-compose up -d minio

# Ou démarrage direct
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

### 3. Test de la configuration

```bash
# Compiler le projet
npm run build

# Tester la connexion MinIO
npm run minio:test
```

## Utilisation

### Initialisation

```typescript
import minioConfig from './config/minio';
import storageService from './services/storage.service';

// Initialiser MinIO
await minioConfig.initialize();
```

### Upload de fichiers

```typescript
import fs from 'fs';
import storageService from './services/storage.service';

// Upload d'un fichier
const fileStream = fs.createReadStream('path/to/file.jpg');
const result = await storageService.uploadFile(
  'images/photo.jpg',
  fileStream,
  {
    contentType: 'image/jpeg',
    metadata: {
      'user-id': '123',
      'category': 'property'
    }
  }
);

console.log('Fichier uploadé:', result);
```

### Download de fichiers

```typescript
// Télécharger un fichier
const downloadStream = await storageService.downloadFile('images/photo.jpg');

// Sauvegarder le fichier
const writeStream = fs.createWriteStream('downloaded-photo.jpg');
downloadStream.pipe(writeStream);
```

### Génération d'URLs

```typescript
// URL pré-signée (expire après 1 heure)
const presignedURL = await storageService.getFileURL('images/photo.jpg', 3600);

// URL publique directe (si le bucket est public)
const publicURL = storageService.getPublicURL('images/photo.jpg');
```

### Suppression de fichiers

```typescript
// Supprimer un fichier
await storageService.deleteFile('images/photo.jpg');
```

### Gestion des fichiers

```typescript
// Vérifier si un fichier existe
const exists = await storageService.fileExists('images/photo.jpg');

// Obtenir les informations d'un fichier
const fileInfo = await storageService.getFileInfo('images/photo.jpg');

// Lister les fichiers
const files = await storageService.listFiles('images/');

// Copier un fichier
await storageService.copyFile('images/photo.jpg', 'images/photo-copy.jpg');
```

## Structure des dossiers

Il est recommandé d'organiser les fichiers selon cette structure :

```
darna-media/
├── images/
│   ├── properties/
│   │   ├── thumbnails/
│   │   └── galleries/
│   ├── users/
│   │   └── avatars/
│   └── temp/
├── videos/
│   ├── properties/
│   └── temp/
├── documents/
│   ├── contracts/
│   └── reports/
└── temp/
```

## Sécurité

### Politique de bucket

Le bucket est configuré avec une politique publique en lecture seule pour les fichiers. Les URLs pré-signées sont recommandées pour l'accès sécurisé.

### Authentification

MinIO utilise des clés d'accès et des clés secrètes pour l'authentification. Assurez-vous de :

1. Utiliser des clés fortes en production
2. Roter régulièrement les clés
3. Limiter les permissions des clés

### HTTPS

Activez HTTPS en production :

```env
MINIO_USE_SSL=true
MINIO_PORT=443
```

## Monitoring et logs

### Vérification de l'état

```typescript
// Vérifier la connexion
const isConnected = minioConfig.isConnectionActive();

// Tester la connexion
const testResult = await minioConfig.testConnection();

// Obtenir les informations de connexion
const connectionInfo = minioConfig.getConnectionInfo();
```

### Logs

Les opérations MinIO sont automatiquement loggées via le système de logging de l'application.

## Gestion des erreurs

```typescript
try {
  await storageService.uploadFile('test.jpg', fileStream);
} catch (error) {
  if (error.code === 'NoSuchBucket') {
    console.error('Bucket non trouvé');
  } else if (error.code === 'AccessDenied') {
    console.error('Accès refusé');
  } else {
    console.error('Erreur inconnue:', error);
  }
}
```

## Exemples d'utilisation dans les routes

### Route d'upload

```typescript
import express from 'express';
import multer from 'multer';
import storageService from '../services/storage.service';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const objectName = `images/${Date.now()}-${req.file.originalname}`;
    const result = await storageService.uploadFile(
      objectName,
      req.file.buffer,
      {
        contentType: req.file.mimetype,
        metadata: {
          'original-name': req.file.originalname,
          'user-id': req.user.id
        }
      }
    );

    res.json({
      success: true,
      file: {
        name: result.name,
        size: result.size,
        url: storageService.getPublicURL(objectName)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});
```

### Route de téléchargement

```typescript
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const stream = await storageService.downloadFile(`images/${filename}`);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    stream.pipe(res);
  } catch (error) {
    res.status(404).json({ error: 'Fichier non trouvé' });
  }
});
```

## Maintenance

### Nettoyage des fichiers temporaires

```typescript
// Supprimer les fichiers temporaires anciens
const tempFiles = await storageService.listFiles('temp/');
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

for (const file of tempFiles) {
  if (file.lastModified < oneDayAgo) {
    await storageService.deleteFile(file.name);
  }
}
```

### Sauvegarde

MinIO peut être configuré pour la réplication automatique. Consultez la documentation MinIO pour plus de détails.

## Dépannage

### Problèmes courants

1. **Erreur de connexion** : Vérifiez les variables d'environnement
2. **Bucket non trouvé** : Le bucket est créé automatiquement au premier usage
3. **Accès refusé** : Vérifiez les clés d'accès et les permissions
4. **SSL/TLS** : Vérifiez la configuration SSL en production

### Commandes utiles

```bash
# Tester la connexion
npm run minio:test

# Vérifier les logs
npm run logs

# Redémarrer MinIO
docker-compose restart minio
```

## Ressources

- [Documentation MinIO](https://docs.min.io/)
- [Client JavaScript MinIO](https://docs.min.io/docs/javascript-client-quickstart-guide.html)
- [Configuration Docker MinIO](https://docs.min.io/docs/deploy-minio-on-docker.html)

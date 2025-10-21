const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Script de test pour MinIO
 * Teste l'upload et download basique
 */

async function testMinIO() {
  console.log('🧪 Démarrage des tests MinIO...\n');

  try {
    // Compiler TypeScript
    console.log('📦 Compilation TypeScript...');
    await runCommand('npm', ['run', 'build']);
    console.log('✅ Compilation terminée\n');

    // Importer les modules compilés
    const minioConfig = require('../dist/src/config/minio.js').default;
    const storageService = require('../dist/src/services/storage.service.js').default;

    // Initialiser MinIO
    console.log('🔧 Initialisation de MinIO...');
    await minioConfig.initialize();
    console.log('✅ MinIO initialisé\n');

    // Test de connexion
    console.log('🔍 Test de connexion...');
    const connectionTest = await minioConfig.testConnection();
    if (connectionTest) {
      console.log('✅ Connexion MinIO réussie\n');
    } else {
      throw new Error('❌ Test de connexion échoué');
    }

    // Créer un fichier de test
    const testFileName = 'test-file.txt';
    const testFilePath = path.join(__dirname, testFileName);
    const testContent = 'Ceci est un fichier de test pour MinIO - ' + new Date().toISOString();
    
    console.log('📝 Création du fichier de test...');
    fs.writeFileSync(testFilePath, testContent);
    console.log(`✅ Fichier de test créé: ${testFileName}\n`);

    // Test d'upload
    console.log('⬆️  Test d\'upload...');
    const objectName = `test/${testFileName}`;
    const fileStream = fs.createReadStream(testFilePath);
    
    const uploadResult = await storageService.uploadFile(objectName, fileStream, {
      contentType: 'text/plain',
      metadata: {
        'test': 'true',
        'created-by': 'test-script'
      }
    });
    
    console.log('✅ Upload réussi');
    console.log(`📊 Taille: ${uploadResult.size} bytes`);
    console.log(`📅 Modifié: ${uploadResult.lastModified}\n`);

    // Test de récupération d'informations
    console.log('ℹ️  Test de récupération d\'informations...');
    const fileInfo = await storageService.getFileInfo(objectName);
    console.log('✅ Informations récupérées');
    console.log(`📊 ETag: ${fileInfo.etag}`);
    console.log(`📄 Content-Type: ${fileInfo.contentType}\n`);

    // Test de génération d'URL
    console.log('🔗 Test de génération d\'URL...');
    const presignedURL = await storageService.getFileURL(objectName, 3600); // 1 heure
    const publicURL = storageService.getPublicURL(objectName);
    
    console.log('✅ URLs générées');
    console.log(`🔗 URL pré-signée: ${presignedURL}`);
    console.log(`🌐 URL publique: ${publicURL}\n`);

    // Test de download
    console.log('⬇️  Test de download...');
    const downloadStream = await storageService.downloadFile(objectName);
    const downloadPath = path.join(__dirname, 'downloaded-' + testFileName);
    const writeStream = fs.createWriteStream(downloadPath);
    
    downloadStream.pipe(writeStream);
    
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    console.log('✅ Download réussi');
    
    // Vérifier le contenu téléchargé
    const downloadedContent = fs.readFileSync(downloadPath, 'utf8');
    if (downloadedContent === testContent) {
      console.log('✅ Contenu vérifié - Upload/Download fonctionne correctement\n');
    } else {
      throw new Error('❌ Contenu téléchargé ne correspond pas au fichier original');
    }

    // Test de liste des fichiers
    console.log('📋 Test de liste des fichiers...');
    const files = await storageService.listFiles('test/');
    console.log(`✅ ${files.length} fichier(s) trouvé(s) dans le dossier test/`);
    files.forEach(file => {
      console.log(`  - ${file.name} (${file.size} bytes)`);
    });
    console.log('');

    // Test de suppression
    console.log('🗑️  Test de suppression...');
    await storageService.deleteFile(objectName);
    console.log('✅ Fichier supprimé\n');

    // Vérifier que le fichier a été supprimé
    const fileExists = await storageService.fileExists(objectName);
    if (!fileExists) {
      console.log('✅ Vérification de suppression réussie\n');
    } else {
      throw new Error('❌ Le fichier existe encore après suppression');
    }

    // Nettoyage
    console.log('🧹 Nettoyage...');
    fs.unlinkSync(testFilePath);
    fs.unlinkSync(downloadPath);
    console.log('✅ Fichiers de test supprimés\n');

    console.log('🎉 Tous les tests MinIO ont réussi !');
    console.log('✅ Upload/Download basique fonctionne correctement');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit' });
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

// Exécuter les tests
testMinIO();

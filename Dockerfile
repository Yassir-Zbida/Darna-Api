# Utiliser l'image officielle Node.js 18 Alpine
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S darna -u 1001

# Copier les fichiers de configuration des dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Compiler TypeScript
RUN npm run build

# Créer les répertoires nécessaires et définir les permissions
RUN mkdir -p logs uploads dist && \
    chown -R darna:nodejs /app

# Changer vers l'utilisateur non-root
USER darna

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Point d'entrée avec dumb-init pour une gestion propre des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande par défaut
CMD ["node", "dist/src/app.js"]

# Utilisation d'une image Node.js
FROM node:20-slim

# Création du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
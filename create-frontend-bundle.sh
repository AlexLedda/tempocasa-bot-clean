#!/bin/bash
# Script per creare tutti i file essenziali del frontend

echo "Creazione file essenziali frontend per GitHub..."

# Crea le directory necessarie
mkdir -p github-frontend/public
mkdir -p github-frontend/src/pages
mkdir -p github-frontend/src/components/ui
mkdir -p github-frontend/src/hooks
mkdir -p github-frontend/src/lib

# Copia i file essenziali
cp /app/frontend/package.json github-frontend/
cp /app/frontend/vercel.json github-frontend/
cp /app/frontend/.gitignore github-frontend/
cp /app/frontend/craco.config.js github-frontend/
cp /app/frontend/tailwind.config.js github-frontend/
cp /app/frontend/postcss.config.js github-frontend/
cp /app/frontend/.env.example github-frontend/
cp /app/frontend/jsconfig.json github-frontend/
cp /app/frontend/components.json github-frontend/

# Public
cp /app/frontend/public/index.html github-frontend/public/

# Source files
cp /app/frontend/src/index.js github-frontend/src/
cp /app/frontend/src/App.js github-frontend/src/
cp /app/frontend/src/App.css github-frontend/src/
cp /app/frontend/src/index.css github-frontend/src/

# Pages
cp /app/frontend/src/pages/*.js github-frontend/src/pages/

# Components UI
cp -r /app/frontend/src/components/ui/* github-frontend/src/components/ui/

# Hooks
cp /app/frontend/src/hooks/*.js github-frontend/src/hooks/

# Lib
cp /app/frontend/src/lib/*.js github-frontend/src/lib/

# Crea zip
cd github-frontend
zip -r ../frontend-github-ready.zip . -x "*.git*" "node_modules/*"
cd ..

echo "✅ File pronti in: frontend-github-ready.zip"
echo "📦 Estrai e carica su GitHub!"

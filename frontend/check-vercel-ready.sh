#!/bin/bash

# Script di verifica pre-deploy per Vercel

echo "🔍 Verifica Preparazione Deploy Vercel"
echo "======================================"
echo ""

cd /app/frontend

# 1. Verifica files necessari
echo "✓ Controllo files necessari..."
if [ -f "vercel.json" ]; then
    echo "  ✅ vercel.json presente"
else
    echo "  ❌ vercel.json mancante"
fi

if [ -f "package.json" ]; then
    echo "  ✅ package.json presente"
else
    echo "  ❌ package.json mancante"
fi

if [ -f ".env.example" ]; then
    echo "  ✅ .env.example presente"
else
    echo "  ❌ .env.example mancante"
fi

echo ""

# 2. Test build locale
echo "🏗️  Test build locale..."
echo "  Questo potrebbe richiedere 1-2 minuti..."
echo ""

yarn install --silent > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Dipendenze installate"
else
    echo "  ❌ Errore installazione dipendenze"
    exit 1
fi

yarn build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Build completato con successo!"
    echo "  ✅ Output directory: build/"
else
    echo "  ❌ Build fallito. Controlla /tmp/build.log"
    cat /tmp/build.log
    exit 1
fi

echo ""

# 3. Verifica variabili d'ambiente
echo "⚙️  Variabili d'ambiente..."
if [ -f ".env" ]; then
    BACKEND_URL=$(grep REACT_APP_BACKEND_URL .env | cut -d '=' -f2)
    echo "  ✅ REACT_APP_BACKEND_URL: $BACKEND_URL"
    echo "  ⚠️  Ricorda di configurare questa variabile su Vercel!"
else
    echo "  ⚠️  .env non presente (normale, configureremo su Vercel)"
fi

echo ""

# 4. Dimensione build
BUILD_SIZE=$(du -sh build 2>/dev/null | cut -f1)
echo "📦 Dimensione build: $BUILD_SIZE"

echo ""
echo "======================================"
echo "✅ Frontend pronto per il deploy!"
echo ""
echo "📋 Prossimi passi:"
echo "  1. Pusha su GitHub: git push"
echo "  2. Importa su Vercel: vercel.com"
echo "  3. Configura REACT_APP_BACKEND_URL"
echo "  4. Deploy!"
echo ""
echo "📚 Guide disponibili:"
echo "  - VERCEL_GUIDA_RAPIDA.md (italiano)"
echo "  - VERCEL_DEPLOY_GUIDE.md (inglese, dettagliata)"
echo "======================================"

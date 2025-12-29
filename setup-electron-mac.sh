#!/bin/bash
# Setup Script für Electron Desktop App auf MacBook

set -e

echo "🚀 Aklow Workspace - Electron Setup für Mac"
echo "============================================"
echo ""

# Prüfe ob wir auf Mac sind
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Dieses Script ist nur für macOS!"
    exit 1
fi

# Prüfe ob pnpm installiert ist
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm wird installiert..."
    npm install -g pnpm
fi

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "package.json" ]; then
    echo "❌ Bitte führe dieses Script im Frontend-Verzeichnis aus!"
    echo "   cd /path/to/frontend"
    exit 1
fi

echo "✅ pnpm gefunden: $(pnpm --version)"
echo ""

# Installiere Dependencies
echo "📦 Installiere Electron Dependencies..."
pnpm add -D electron electron-builder concurrently wait-on

echo ""
echo "✅ Dependencies installiert!"
echo ""
echo "🎯 Nächste Schritte:"
echo "   1. Prüfe ob electron/ Ordner existiert"
echo "   2. Führe aus: pnpm electron:build:mac"
echo ""

# Prüfe ob electron/ Ordner existiert
if [ ! -d "electron" ]; then
    echo "⚠️  electron/ Ordner nicht gefunden!"
    echo "   Bitte stelle sicher, dass die Electron-Dateien vorhanden sind."
    exit 1
fi

echo "✅ Electron-Ordner gefunden!"
echo ""
echo "🚀 Starte Build..."
pnpm electron:build:mac

echo ""
echo "✅ Fertig! Die DMG-Datei sollte in dist/ sein."

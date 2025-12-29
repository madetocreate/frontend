#!/usr/bin/env node

/**
 * Script zum Generieren der PWA-Icons aus den Route-Handlern
 * 
 * Nutzung:
 * 1. Starte den Dev-Server: pnpm dev
 * 2. Führe dieses Script aus: node scripts/generate-pwa-icons.js
 * 
 * Das Script lädt die Icons von localhost:3000 und speichert sie in public/icons/
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

const ICONS = [
  { url: '/icon-192x192.png', filename: 'icon-192x192.png' },
  { url: '/icon-512x512.png', filename: 'icon-512x512.png' },
  { url: '/maskable-icon-512x512.png', filename: 'maskable-icon-512x512.png' },
  { url: '/apple-touch-icon.png', filename: 'apple-touch-icon.png' },
];

function downloadIcon(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(OUTPUT_DIR, filename);
    
    http.get(`${BASE_URL}${url}`, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  // Erstelle Output-Verzeichnis falls nicht vorhanden
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  console.log('Generiere PWA-Icons...');
  console.log(`Stelle sicher, dass der Dev-Server auf ${BASE_URL} läuft.\n`);
  
  try {
    await Promise.all(ICONS.map(icon => downloadIcon(icon.url, icon.filename)));
    console.log('\n✓ Alle Icons erfolgreich generiert!');
  } catch (error) {
    console.error('\n✗ Fehler beim Generieren der Icons:', error.message);
    console.error('\nStelle sicher, dass:');
    console.error('1. Der Dev-Server läuft (pnpm dev)');
    console.error('2. Der Server auf localhost:3000 erreichbar ist');
    process.exit(1);
  }
}

main();

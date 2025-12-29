# PWA Icons

Die PWA-Icons müssen als statische PNG-Dateien in diesem Verzeichnis liegen.

## Generierung der Icons

Die Icons werden aus den Route-Handlern in `src/app/icon-*.png/route.tsx` generiert.

### Option 1: Manuell über Browser
1. Starte den Dev-Server: `pnpm dev`
2. Öffne im Browser:
   - http://localhost:3000/icon-192x192.png
   - http://localhost:3000/icon-512x512.png
   - http://localhost:3000/maskable-icon-512x512.png
   - http://localhost:3000/apple-touch-icon.png
3. Speichere die Bilder als PNG in diesem Verzeichnis:
   - `icon-192x192.png`
   - `icon-512x512.png`
   - `maskable-icon-512x512.png`
   - `apple-touch-icon.png`

### Option 2: Automatisch per Script (TODO)
Ein Script, das die Route-Handler aufruft und die Icons speichert, kann in `scripts/generate-pwa-icons.js` implementiert werden.

## Benötigte Icons

- `icon-192x192.png` (192x192px, any purpose)
- `icon-512x512.png` (512x512px, any purpose)
- `maskable-icon-512x512.png` (512x512px, maskable purpose)
- `apple-touch-icon.png` (180x180px, für iOS)


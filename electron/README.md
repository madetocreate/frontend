# Electron Desktop App - Build Anleitung

Diese Anleitung erklärt, wie du die Aklow Workspace App als native Desktop-App (DMG für Mac, EXE für Windows) baust.

## Voraussetzungen

- Node.js 18+ auf deinem lokalen Rechner (nicht im Docker-Container)
- npm oder pnpm installiert
- Für Mac: Xcode Command Line Tools (`xcode-select --install`)
- Für Windows: Visual Studio Build Tools

## Installation

### 1. Dependencies installieren

```bash
cd /opt/aklow/Backend/frontend
npm install --save-dev electron electron-builder concurrently wait-on
```

Oder mit pnpm:
```bash
pnpm add -D electron electron-builder concurrently wait-on
```

## Development

### Electron-App im Development-Modus starten:

```bash
npm run electron:dev
```

Dies startet:
1. Next.js Dev-Server auf `http://localhost:3000`
2. Electron-App, die die lokale URL lädt

## Production Build

### Mac (DMG erstellen):

```bash
npm run electron:build:mac
```

Die DMG-Datei wird in `dist/` erstellt:
- `dist/Aklow Workspace-1.0.0.dmg` - Installer
- `dist/Aklow Workspace-1.0.0-mac.zip` - App Bundle

### Windows (EXE erstellen):

```bash
npm run electron:build:win
```

Erstellt in `dist/`:
- `dist/Aklow Workspace Setup 1.0.0.exe` - Installer
- `dist/Aklow Workspace-1.0.0-win.zip` - Portable Version

### Linux (AppImage & DEB):

```bash
npm run electron:build:linux
```

Erstellt in `dist/`:
- `dist/Aklow Workspace-1.0.0.AppImage` - Portable
- `dist/aklow-workspace_1.0.0_amd64.deb` - Debian Package

## Installation auf Mac

1. Öffne die `.dmg` Datei
2. Ziehe "Aklow Workspace" in den "Applications" Ordner
3. Öffne die App aus dem Applications-Ordner
4. Bei der ersten Installation: Systemeinstellungen → Sicherheit → "Trotzdem öffnen"

## Code-Signing (Optional, für Distribution)

Für Code-Signing auf Mac, füge in `package.json` unter `build.mac` hinzu:

```json
"identity": "Developer ID Application: Dein Name (TEAM_ID)"
```

Dann vor dem Build:
```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
npm run electron:build:mac
```

## Troubleshooting

### "electron-builder not found"
```bash
npm install --save-dev electron-builder
```

### Build schlägt fehl
- Stelle sicher, dass `npm run build` erfolgreich ist
- Prüfe, ob alle Dependencies installiert sind
- Für Mac: Xcode Command Line Tools installieren

### App startet nicht
- Prüfe die Logs in der Konsole
- Stelle sicher, dass Next.js Build erfolgreich war
- Im Dev-Modus: Prüfe ob `http://localhost:3000` erreichbar ist

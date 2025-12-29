# 📱 Electron App auf MacBook installieren

## Problem
Die Dateien sind auf dem Server, aber du brauchst sie auf deinem MacBook zum Bauen.

## Lösung: Dateien auf MacBook kopieren

### Option 1: Über SSH (Empfohlen)

1. **Auf deinem MacBook, verbinde dich mit dem Server:**
   ```bash
   ssh user@server-ip
   ```

2. **Kopiere das Frontend-Verzeichnis:**
   ```bash
   # Auf dem Server:
   cd /opt/aklow/monorepo/apps/frontend
   tar -czf frontend-electron.tar.gz . --exclude=node_modules --exclude=.next
   ```

3. **Auf deinem MacBook, kopiere die Datei:**
   ```bash
   scp user@server-ip:/opt/aklow/monorepo/apps/frontend/frontend-electron.tar.gz ~/Desktop/
   ```

4. **Entpacke auf deinem MacBook:**
   ```bash
   cd ~/Desktop
   mkdir aklow-workspace
   cd aklow-workspace
   tar -xzf ../frontend-electron.tar.gz
   ```

5. **Installiere Dependencies und baue:**
   ```bash
   pnpm install
   pnpm electron:build:mac
   ```

### Option 2: Git (Falls das Repo auf GitHub/GitLab ist)

1. **Auf deinem MacBook:**
   ```bash
   git clone <repo-url>
   cd monorepo/apps/frontend
   pnpm install
   pnpm electron:build:mac
   ```

### Option 3: Direkt vom Server bauen (Nur wenn Server Mac ist)

Falls dein Server auch ein Mac ist:
```bash
ssh user@server-ip
cd /opt/aklow/monorepo/apps/frontend
pnpm electron:build:mac
```

## Schnellstart (Nach dem Kopieren)

```bash
cd ~/Desktop/aklow-workspace  # oder wo auch immer du es entpackt hast
pnpm install
pnpm electron:build:mac
```

Die DMG-Datei wird in `dist/` erstellt!

## Troubleshooting

### "pnpm not found"
```bash
npm install -g pnpm
```

### "electron:build:mac not found"
```bash
pnpm add -D electron electron-builder concurrently wait-on
```

### "Permission denied"
```bash
chmod +x setup-electron-mac.sh
```

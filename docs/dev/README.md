# Development Dokumentation

Dokumentation für lokale Entwicklung und interne Workflows.

## Wichtige Dokumente

### 🔐 Security & Authentifizierung
- **[SECURITY_DEV_MODE.md](./SECURITY_DEV_MODE.md)** - Security-Deaktivierung für lokale Entwicklung
- **[DEVELOPMENT_NOTES.md](./DEVELOPMENT_NOTES.md)** - Schnellstart und wichtige Hinweise

### 📊 Inventare & Status
- **[INVENTAR_V2.md](./INVENTAR_V2.md)** - Komponenten-Inventar V2
- **[MEMORY_UI_AUDIT.md](./MEMORY_UI_AUDIT.md)** - Memory-UI Audit
- **[MEMORY_MIGRATION_REPORT.md](./MEMORY_MIGRATION_REPORT.md)** - Memory Migration Status
- **[SMOKE_TEST_REPORT.md](./SMOKE_TEST_REPORT.md)** - Smoke Test Ergebnisse
- **[V2_FINALIZATION_SUMMARY.md](./V2_FINALIZATION_SUMMARY.md)** - V2 Finalisierung

### 🔧 Setup & Entwicklung
- **[../dev_state.md](../dev_state.md)** - Aktueller Entwicklungsstand & Repo-Struktur

## Schnellstart

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build (Production)
npm run build

# Tests
npm test
```

## Wichtige Environment-Variablen

### Chat-Funktion (Pflicht)

Für die Chat-Route (`/chat`) müssen folgende Variablen gesetzt sein:

```bash
# .env.local (Development)
NODE_ENV=development

# Authentication (Pflicht für Chat)
AUTH_SECRET=your-super-secret-auth-key-change-this-in-production
# Muss mit dem AUTH_SECRET im Node Backend übereinstimmen

# Backend URLs (Pflicht für Chat)
AGENT_BACKEND_URL=http://localhost:8000
# Oder alternativ (wird als Fallback verwendet):
NEXT_PUBLIC_AGENT_BACKEND_URL=http://localhost:8000

# Internal API Key (Pflicht für Service-to-Service Calls)
INTERNAL_API_KEY=your-internal-api-key-here
# Muss mit dem INTERNAL_API_KEY im Python Backend übereinstimmen

# Tenant ID (Optional in Dev, Pflicht in Production)
NEXT_PUBLIC_DEFAULT_TENANT_ID=aklow-main
# Wird nur verwendet wenn ALLOW_ENV_TENANT_FALLBACK_DEV=true

# Development Flags (Optional)
ALLOW_ENV_TENANT_FALLBACK_DEV=true  # Erlaubt ENV-Fallback für tenantId in Dev
ALLOW_UNVERIFIED_JWT_DEV=true       # Erlaubt unverifizierte JWT-Decode in Dev
```

### Services & Ports

Die Chat-Funktion benötigt folgende laufende Services:

1. **Next.js Frontend** (Port 3000)
   ```bash
   npm run dev
   ```

2. **Node Gateway/Orchestrator** (Port 4000, optional wenn next_proxy verwendet wird)
   ```bash
   cd Backend
   npm run dev
   ```

3. **Python Backend** (Port 8000, **Pflicht für Chat**)
   ```bash
   cd Backend/backend-agents
   ./start.sh
   # oder
   python -m uvicorn main:app --reload --port 8000
   ```

### Transport-Modus

```bash
# Empfohlen: Same-Origin Proxy (vermeidet CORS/Port-Chaos)
NEXT_PUBLIC_CHAT_TRANSPORT=next_proxy

# Alternative: Direkter Zugriff auf Backend
NEXT_PUBLIC_CHAT_TRANSPORT=direct
```

### Legacy/Andere Variablen

```bash
# Backend URLs
ORCHESTRATOR_API_URL=http://localhost:8000
```

## Bekannte Development-Modi

### Security deaktiviert
Im Development-Modus ist die Authentifizierung deaktiviert:
- Keine JWT-Verifizierung
- Auto-Fallback zu `aklow-main` Tenant
- Keine 401-Fehler

📖 Details: [SECURITY_DEV_MODE.md](./SECURITY_DEV_MODE.md)

## Häufige Probleme

### JWT Verification Failed
**Lösung**: Normal im Development-Modus - Security ist deaktiviert

### 401 Unauthorized
**Lösung**: Prüfe ob `NODE_ENV=development` gesetzt ist

### Memory API Fehler
**Lösung**: Backend-URL in `.env.local` konfigurieren

## Weitere Ressourcen

- [Frontend Architecture](../ARCHITECTURE.md)
- [Design System](../DESIGN_SYSTEM.md)
- [Setup Guide](../setup/GETTING_STARTED.md)

---

**Letzte Aktualisierung**: Dezember 2025


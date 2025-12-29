# Environment Variables Setup Guide

## Übersicht

Dieses Projekt benötigt Environment-Variablen für drei Komponenten:
1. **Frontend** (Next.js)
2. **Orchestrator Backend** (Node.js/Fastify)
3. **Agent Backend** (Python/FastAPI)

## Schnellstart

### 1. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
```

Dann bearbeite `.env.local` und setze:

```env
# WICHTIG: Diese beiden müssen gesetzt sein, sonst zeigt die Inbox nur Dummy-Daten!
ORCHESTRATOR_API_URL=http://localhost:4000
ORCHESTRATOR_TENANT_ID=demo

# Agent Backend (Python)
AGENT_BACKEND_URL=http://127.0.0.1:8000
MEMORY_API_SECRET=your-memory-api-secret-here

# Public URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_CHATKIT_API_URL=http://127.0.0.1:8000/chatkit
NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=domain_pk_localhost_dev

# Optional (empfohlen in Dev): nutzt Same-Origin Next Proxy statt direktem Port-Zugriff
# (vermeidet CORS/Port-Chaos; funktioniert robust in Docker/Hybrid-Setups)
NEXT_PUBLIC_CHAT_TRANSPORT=next_proxy
```

**Wichtig**: Nach Änderungen an `.env.local` muss der Next.js Dev-Server neu gestartet werden!

### 2. Orchestrator Backend Setup

```bash
cd Backend
cp .env.example .env
```

Dann bearbeite `.env` und setze:

```env
PORT=4000
AUTH_SECRET=your-super-secret-auth-key-change-this-in-production
AUTH_REQUIRE_SIGNED_TOKENS=true
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aklow
MEMORY_API_URL=http://127.0.0.1:8000
MEMORY_API_SECRET=your-memory-api-secret-here
CORS_ORIGIN=http://localhost:3000
```

### 3. Agent Backend (Python) Setup

```bash
cd Backend/backend-agents
cp .env.example .env
# oder
cp .env.example backend.env
```

Dann bearbeite die Datei und setze:

```env
MEMORY_API_SECRET=your-memory-api-secret-here
```

**Wichtig**: `MEMORY_API_SECRET` muss in allen drei Komponenten **identisch** sein!

## Detaillierte Erklärung

### Frontend Variablen

#### `ORCHESTRATOR_API_URL`
- **Bedeutung**: URL zum Orchestrator-Backend (Node.js/Fastify)
- **Standard**: `http://localhost:4000`
- **Wichtig**: Muss gesetzt sein, sonst zeigt die Inbox nur Dummy-Daten!

#### `ORCHESTRATOR_TENANT_ID`
- **Bedeutung**: Tenant-ID für den Orchestrator
- **Standard**: `demo`
- **Wichtig**: Muss mit der `tenant_id` übereinstimmen, die im Memory-Backend verwendet wird!
- **Beispiele**: `demo`, `local`, `aklow-local`

#### `ORCHESTRATOR_API_TOKEN` (Optional)
- **Bedeutung**: JWT-Token für Authentifizierung
- **Nur benötigt**: Wenn `AUTH_REQUIRE_SIGNED_TOKENS=true` im Backend
- **Erzeugung**: Siehe "Token-Erzeugung" unten

#### `AGENT_BACKEND_URL`
- **Bedeutung**: URL zum Python FastAPI Backend
- **Standard**: `http://127.0.0.1:8000`

#### `MEMORY_API_SECRET`
- **Bedeutung**: Secret für Memory-API Authentifizierung
- **Wichtig**: Muss in Frontend, Orchestrator UND Python-Backend identisch sein!

### Orchestrator Backend Variablen

#### `AUTH_SECRET`
- **Bedeutung**: Secret für JWT-Token-Signierung
- **Wichtig**: Verwende einen starken, zufälligen String in Production!

#### `AUTH_REQUIRE_SIGNED_TOKENS`
- **Bedeutung**: Ob signierte Tokens erforderlich sind
- **Werte**: `true` (Production) oder `false` (Development)
- **Bei `false`**: Auch unsignierte Tokens werden akzeptiert

#### `DATABASE_URL`
- **Bedeutung**: PostgreSQL Connection String
- **Format**: `postgresql://user:password@host:port/database`

### Python Backend Variablen

#### `MEMORY_API_SECRET`
- **Bedeutung**: Secret für Memory-API Authentifizierung
- **Wichtig**: Muss mit Frontend und Orchestrator übereinstimmen!

## Token-Erzeugung (Optional)

Falls du `ORCHESTRATOR_API_TOKEN` benötigst, kannst du einen Token so erzeugen:

### Mit Node.js:

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { tenantId: 'demo' },
  'your-super-secret-auth-key-change-this-in-production',
  { algorithm: 'HS256' }
);

console.log(token);
```

### Oder mit einem einfachen Script:

Erstelle `Backend/scripts/generate-token.js`:

```javascript
const jwt = require('jsonwebtoken');
const secret = process.env.AUTH_SECRET || 'your-super-secret-auth-key';
const tenantId = process.argv[2] || 'demo';

const token = jwt.sign({ tenantId }, secret, { algorithm: 'HS256' });
console.log('Token:', token);
console.log('Tenant ID:', tenantId);
```

Dann ausführen:
```bash
cd Backend
AUTH_SECRET=your-secret node scripts/generate-token.js demo
```

## Troubleshooting

### "ORCHESTRATOR_API_URL oder ORCHESTRATOR_TENANT_ID ist nicht gesetzt"
- **Lösung**: Setze beide Variablen in `frontend/.env.local`
- **Wichtig**: Next.js Dev-Server neu starten nach Änderungen!

### "invalid_auth_token" Fehler
- **Lösung 1**: Setze `AUTH_REQUIRE_SIGNED_TOKENS=false` im Backend (nur Development!)
- **Lösung 2**: Erzeuge einen gültigen Token (siehe "Token-Erzeugung" oben)

### "MEMORY_API_SECRET is not configured"
- **Lösung**: Setze `MEMORY_API_SECRET` in allen drei Komponenten (Frontend, Orchestrator, Python)

### Memory-API gibt 401/403 zurück
- **Lösung**: Prüfe, ob `MEMORY_API_SECRET` in allen Komponenten identisch ist

## Checkliste

- [ ] Frontend `.env.local` erstellt und konfiguriert
- [ ] Orchestrator `.env` erstellt und konfiguriert
- [ ] Python Backend `.env` erstellt und konfiguriert
- [ ] `MEMORY_API_SECRET` in allen drei Komponenten identisch
- [ ] `ORCHESTRATOR_API_URL` und `ORCHESTRATOR_TENANT_ID` im Frontend gesetzt
- [ ] Next.js Dev-Server neu gestartet (nach .env.local Änderungen)
- [ ] Orchestrator läuft auf Port 4000
- [ ] Python Backend läuft auf Port 8000
- [ ] PostgreSQL läuft und ist erreichbar


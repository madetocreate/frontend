# 🚀 Quick Start: Environment Variables

## Frontend (.env.local)

Erstelle `frontend/.env.local` mit folgendem Inhalt:

```env
# WICHTIG: Diese beiden müssen gesetzt sein!
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
NEXT_PUBLIC_CHAT_TRANSPORT=next_proxy
```

**Nach Änderungen**: Next.js Dev-Server neu starten!

## Orchestrator Backend (.env)

Erstelle `Backend/.env` mit folgendem Inhalt:

```env
PORT=4000
AUTH_SECRET=your-super-secret-auth-key-change-this-in-production
AUTH_REQUIRE_SIGNED_TOKENS=true
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aklow
MEMORY_API_URL=http://127.0.0.1:8000
MEMORY_API_SECRET=your-memory-api-secret-here
CORS_ORIGIN=http://localhost:3000
```

## Python Backend (.env)

Erstelle `Backend/backend-agents/.env` mit folgendem Inhalt:

```env
MEMORY_API_SECRET=your-memory-api-secret-here
```

**WICHTIG**: `MEMORY_API_SECRET` muss in allen drei Dateien **identisch** sein!

## Token-Erzeugung (Optional)

Falls `AUTH_REQUIRE_SIGNED_TOKENS=true`:

```bash
cd Backend
AUTH_SECRET=your-secret node scripts/generate-token.js demo
```

Dann den Token in `frontend/.env.local` eintragen:
```env
ORCHESTRATOR_API_TOKEN=<generierter-token>
```


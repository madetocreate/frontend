# API-Integrations-Übersicht

## ✅ Bereits verbunden

1. **Memory API**: `/api/memory/*` → Next.js Routes → Backend (`/memory/*`)
   - `POST /api/memory/save` → `POST /memory/write` (mit Auth)
   - `POST /api/memory/search` → `POST /memory/search` (mit Auth)
   - `POST /api/memory/delete` → `POST /memory/delete` (mit Auth)
   - `POST /api/memory/archive` → `POST /memory/archive` (mit Auth)
2. **Inbox**: `/api/inbox` → Next.js Route → Orchestrator (`/operator/inbox`)
3. **Audio Transcription**: `/api/audio/transcribe` → Backend (`/audio/transcribe`)
4. **Realtime Tools**: `/api/realtime/*` → Backend (`/realtime/tools/*`)
   - `POST /api/realtime/analysis` → Backend analysis
   - `POST /api/realtime/research` → Backend research
5. **Calendar**: `/api/calendar/search` → Calendar search
6. **ChatKit**: Eigene Backend-URL (`http://127.0.0.1:8000/chatkit`)

## 🔧 Memory API - Implementiert

**Backend-Endpunkte** (FastAPI in `backend-agents/app/`):
- `POST /memory/write` - Memory speichern (benötigt Auth: `Bearer <MEMORY_API_SECRET>`)
- `POST /memory/search` - Memory suchen (benötigt Auth)
- `POST /memory/delete` - Soft Delete (benötigt Auth)
- `POST /memory/archive` - Archivieren (benötigt Auth)

**Frontend-Implementierung**:
- ✅ `/api/memory/save` → verwendet `/memory/write` mit Auth
- ✅ `/api/memory/search` → verwendet `/memory/search` mit Auth
- ✅ `/api/memory/delete` → verwendet `/memory/delete` mit Auth
- ✅ `/api/memory/archive` → verwendet `/memory/archive` mit Auth
- ✅ MemoryDetailPanel → Archive/Delete Buttons implementiert
- ✅ MemorySidebarWidget → Kategorien werden geladen

## ❌ Noch nicht verbunden

### 1. Notifications
- Mark as read
- Mute
- Filter (Alle, Erwähnungen, Aufgaben, System, Sales & Marketing)

### 2. Marketing Quick Actions
- Aktionen ausführen
- Kampagnen erstellen
- Content generieren

### 3. Automation Quick Actions
- Workflows starten
- Workflow-Status abfragen

### 4. Telephony
- Modi ändern
- Anrufe verwalten
- Gespräche übernehmen/pausieren

### 5. Calendar
- Termine abrufen
- Termine erstellen
- AI-Zusammenfassungen

### 6. Composer Tools
- Datei-Upload
- Internet-Suche
- Bild erstellen
- Lernmodus

## 📋 Backend-API-Struktur

### FastAPI Backend (backend-agents/app/)
- **Port**: 8000 (Standard)
- **Base URL**: `http://127.0.0.1:8000`
- **Endpoints**:
  - Memory API: `/memory/*` (mit Bearer Token Auth)
  - Audio API: `/audio/transcribe`
  - Chat API: `/chat`, `/chat/stream`
  - CRM API: `/crm/*` (Phase 1-10)
  - Support API: `/support/*`
  - Marketing API: `/marketing/*`
  - Website API: `/website/*`
  - Backoffice API: `/backoffice/*`
  - Operator Inbox: `/operator_inbox/*`
  - Feedback API: `/feedback/*`
  - Onboarding API: `/onboarding/*`
  - MCP Tools: `/mcp/memory/*`, `/mcp/crm/*`

### Orchestrator Backend (Fastify)
- **Port**: 4000
- **Base URL**: `http://localhost:4000` (laut `NEXT_PUBLIC_BACKEND_URL`)
- **Endpoints**:
  - Operator Inbox: `/operator/inbox`
  - Realtime Tools: `/realtime/tools/*`
  - Telephony: `/telephony/realtime/*`

## 🔑 Environment Variables

### Frontend (.env.local)
```env
# Orchestrator
ORCHESTRATOR_API_URL=http://localhost:4000
ORCHESTRATOR_TENANT_ID=demo
ORCHESTRATOR_API_TOKEN=<optional>

# Agent Backend
AGENT_BACKEND_URL=http://127.0.0.1:8000
MEMORY_API_SECRET=<secret>

# Public URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_CHATKIT_API_URL=http://127.0.0.1:8000/chatkit
NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=domain_pk_localhost_dev
```

### Backend (.env)
```env
OPENAI_API_KEY=<key>
DATABASE_URL=postgresql://...
MEMORY_API_SECRET=<secret>
MCP_SERVER_URL=http://localhost:9000/mcp
ENABLE_MCP_TOOLS=true
```


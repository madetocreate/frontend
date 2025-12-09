# API-Integrations-Übersicht

## ✅ Bereits verbunden

1. **News Feed**: `/api/newsmanager/feed` → Backend direkt
2. **Inbox**: `/api/inbox` → Next.js Route → Orchestrator (`/operator/inbox`)
3. **Memory Save/Search**: `/api/memory/*` → Next.js Routes → Backend (`/memory/write`, `/memory/search`)
4. **ChatKit**: Eigene Backend-URL (`http://127.0.0.1:8000/chatkit`)

## 🔧 Memory API - Korrekturen nötig

**Backend-Endpunkte** (FastAPI in `backend-agents/app/`):
- `POST /memory/write` - Memory speichern (benötigt Auth: `Bearer <MEMORY_API_SECRET>`)
- `POST /memory/search` - Memory suchen (benötigt Auth)
- `POST /memory/delete` - Soft Delete (benötigt Auth)
- `POST /memory/archive` - Archivieren (benötigt Auth)

**Frontend-Änderungen**:
- ✅ `/api/memory/save` → verwendet jetzt `/memory/write` mit Auth
- ✅ `/api/memory/search` → verwendet jetzt `/memory/search` mit Auth
- ⏳ MemoryDetailPanel → Archive/Delete Buttons verbinden
- ⏳ MemorySidebarWidget → Kategorien aus Backend laden

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

**FastAPI (backend-agents/app/)**:
- Port: Standard FastAPI (meist 8000)
- Memory API: `/memory/*` (mit Auth)

**Fastify (src/routes/)**:
- Port: 4000 (laut `NEXT_PUBLIC_BACKEND_URL`)
- News: `/api/newsmanager/feed`
- Operator Inbox: `/operator/inbox`
- Realtime Tools: `/realtime/tools/*`
- Telephony: `/telephony/realtime/*`

## 🔑 Environment Variables benötigt

- `AGENT_BACKEND_URL` - URL zum FastAPI Backend (z.B. `http://localhost:8000`)
- `MEMORY_API_SECRET` - Secret für Memory-API Auth
- `NEXT_PUBLIC_BACKEND_URL` - URL zum Fastify Backend (z.B. `http://localhost:4000`)
- `ORCHESTRATOR_URL` - URL zum Orchestrator
- `ORCHESTRATOR_TENANT_ID` - Tenant ID
- `ORCHESTRATOR_API_TOKEN` - API Token


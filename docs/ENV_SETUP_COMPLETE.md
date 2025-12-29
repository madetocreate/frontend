# ✅ Frontend Environment Setup - Komplett

## Quick Start

```bash
cd /Users/simple-gpt/frontend
npm run dev
```

**Voraussetzung**: Backend Services müssen laufen (siehe `Backend/docs/ENV_SETUP_COMPLETE.md`)

---

## Environment-Variablen

Die Datei `frontend/.env.local` enthält:

```env
# Orchestrator (Node Backend)
ORCHESTRATOR_API_URL=http://localhost:4000
ORCHESTRATOR_TENANT_ID=aklow-main

# Agent Backend (Python)
AGENT_BACKEND_URL=http://127.0.0.1:8000
MEMORY_API_SECRET=<identisch mit Backend>

# Public URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# Service-to-Service Auth
INTERNAL_API_KEY=<identisch mit Backend>
AUTH_SECRET=<identisch mit Backend>

# Dev Fallbacks
ALLOW_ENV_TENANT_FALLBACK_DEV=true
NEXT_PUBLIC_DEFAULT_TENANT_ID=aklow-main
```

---

## ✅ Verifikation

Nach dem Start sollte im Browser Console sichtbar sein:
- ✅ Keine 401-Fehler mehr
- ✅ `/api/entitlements/check` gibt 200 zurück
- ✅ `/api/inbox` gibt 200 zurück
- ✅ `/api/v2/threads` gibt 200 zurück
- ✅ Chat funktioniert

---

## 🐛 Troubleshooting

**Problem**: Frontend zeigt immer noch 401-Fehler

**Lösung**:
1. Prüfe ob `.env.local` existiert und korrekt ist
2. **Frontend neu starten** (Next.js lädt .env.local nur beim Start)
3. Prüfe Browser Console für spezifische Fehler

**Problem**: "Invalid x-internal-api-key"

**Lösung**:
- Stelle sicher, dass `INTERNAL_API_KEY` in `.env.local` identisch mit Backend ist
- Backend Services neu starten
- Frontend neu starten

---

**Stand**: 2025-12-27  
**Status**: ✅ Funktioniert


# Chat & Memory Connection Debugging

## Problem
- Chat gibt keine Antworten zurück
- Memory ist nicht verbunden
- Frontend funktioniert, Server laufen

## Mögliche Ursachen

### 1. Chat API URL falsch konfiguriert
**Problem**: Chat-Client zeigt auf falschen Port
**Lösung**: 
- Chat sollte auf Port 8000 (FastAPI Backend) zeigen
- Orchestrator ist Port 4000
- Prüfe `.env.local`:

```env
# Chat sollte direkt auf FastAPI Backend zeigen
NEXT_PUBLIC_CHAT_API_URL=http://127.0.0.1:8000
# ODER
AGENT_BACKEND_URL=http://127.0.0.1:8000
```

### 2. Memory API Secret fehlt
**Problem**: Memory-API benötigt Bearer Token
**Lösung**: 
- Prüfe ob `MEMORY_API_SECRET` in `.env.local` gesetzt ist
- Muss identisch sein mit Backend `.env`

### 3. Backend läuft nicht auf Port 8000
**Problem**: FastAPI Backend läuft nicht oder auf anderem Port
**Lösung**:
```bash
# Prüfe ob Backend läuft
curl http://127.0.0.1:8000/health

# Sollte zurückgeben: {"status":"ok"}
```

### 4. CORS Probleme
**Problem**: Browser blockiert Requests
**Lösung**: Prüfe Browser Console für CORS-Fehler

## Debugging Steps

### Schritt 1: Prüfe Environment Variables
```bash
cd frontend
cat .env.local | grep -E "CHAT|BACKEND|MEMORY"
```

Sollte enthalten:
- `AGENT_BACKEND_URL=http://127.0.0.1:8000`
- `MEMORY_API_SECRET=<secret>`
- `NEXT_PUBLIC_CHAT_API_URL=http://127.0.0.1:8000` (optional)

### Schritt 2: Prüfe Backend Health
```bash
curl http://127.0.0.1:8000/health
```

### Schritt 3: Teste Chat Endpoint direkt
```bash
curl -X POST http://127.0.0.1:8000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "demo-tenant",
    "sessionId": "test-session",
    "channel": "web_chat",
    "message": "hi"
  }'
```

### Schritt 4: Prüfe Browser Console
- Öffne Developer Tools (F12)
- Gehe zu Network Tab
- Sende eine Chat-Nachricht
- Prüfe ob Request zu `/chat/stream` geht
- Prüfe Response Status Code

### Schritt 5: Prüfe Memory API
```bash
curl -X POST http://127.0.0.1:8000/memory/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MEMORY_API_SECRET>" \
  -d '{
    "tenant_id": "demo-tenant",
    "query": "test"
  }'
```

## Korrekte Konfiguration

### Frontend `.env.local`
```env
# Orchestrator (Port 4000)
ORCHESTRATOR_API_URL=http://localhost:4000
ORCHESTRATOR_TENANT_ID=demo

# FastAPI Backend (Port 8000) - FÜR CHAT UND MEMORY
AGENT_BACKEND_URL=http://127.0.0.1:8000
MEMORY_API_SECRET=<dein-secret>

# Chat API (optional, falls anders)
NEXT_PUBLIC_CHAT_API_URL=http://127.0.0.1:8000

# Public URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### Backend `.env`
```env
OPENAI_API_KEY=<key>
DATABASE_URL=postgresql://...
MEMORY_API_SECRET=<dasselbe-secret-wie-frontend>
```

## Wichtig
- **Port 8000** = FastAPI Backend (Chat, Memory, Agents)
- **Port 4000** = Orchestrator (Node.js/Fastify)
- Chat muss auf **Port 8000** zeigen
- Memory muss auf **Port 8000** zeigen
- `MEMORY_API_SECRET` muss in Frontend UND Backend identisch sein

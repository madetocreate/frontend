# 🚀 Getting Started - Komplette Einrichtung

## Schnellstart (Automatisch)

### 1. Environment-Variablen automatisch einrichten

```bash
cd Backend
bash scripts/setup-env.sh
```

Das Script:
- ✅ Generiert alle Secrets automatisch
- ✅ Erstellt alle `.env` Dateien
- ✅ Setzt alles konsistent

**Das war's!** Jetzt kannst du die Backends starten.

---

## Manuelle Einrichtung

### Schritt 1: Secrets generieren

Du brauchst zwei Secrets:

```bash
# Memory API Secret (für alle drei Komponenten)
openssl rand -hex 32

# Auth Secret (für Orchestrator)
openssl rand -hex 32
```

**Wichtig**: Der Memory API Secret muss in **allen drei** `.env` Dateien **identisch** sein!

### Schritt 2: Frontend `.env.local` erstellen

```bash
cd frontend
cp .env.example .env.local
```

Dann bearbeite `.env.local`:

```env
# WICHTIG: Diese beiden müssen gesetzt sein!
ORCHESTRATOR_API_URL=http://localhost:4000
ORCHESTRATOR_TENANT_ID=demo

# Agent Backend
AGENT_BACKEND_URL=http://127.0.0.1:8000
MEMORY_API_SECRET=<dein-generiertes-secret>

# Public URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_CHATKIT_API_URL=http://127.0.0.1:8000/chatkit
NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=domain_pk_localhost_dev
```

### Schritt 3: Orchestrator `.env` erstellen

```bash
cd Backend
cp .env.example .env
```

Dann bearbeite `.env`:

```env
PORT=4000
NODE_ENV=development

# Verwende dein generiertes Auth Secret
AUTH_SECRET=<dein-generiertes-auth-secret>
AUTH_REQUIRE_SIGNED_TOKENS=false

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aklow

# Memory API
MEMORY_API_URL=http://127.0.0.1:8000
MEMORY_API_SECRET=<dein-generiertes-memory-secret>

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Schritt 4: Python Backend `.env` erstellen

```bash
cd Backend/backend-agents
cp .env.example .env
```

Dann bearbeite `.env`:

```env
MEMORY_API_SECRET=<dein-generiertes-memory-secret>
```

**Wichtig**: Derselbe Wert wie in Frontend und Orchestrator!

### Schritt 5: Token generieren (Optional)

Falls `AUTH_REQUIRE_SIGNED_TOKENS=true`:

```bash
cd Backend
AUTH_SECRET=<dein-auth-secret> node scripts/generate-token.js demo
```

Dann den Token in `frontend/.env.local` eintragen:

```env
ORCHESTRATOR_API_TOKEN=<generierter-token>
```

---

## Tenant ID - Was ist das?

Die **Tenant ID** ist eine eindeutige Identifikation für deinen Workspace/Tenant.

### Woher bekomme ich eine Tenant ID?

**Option 1: Einfach einen String wählen** (für lokale Entwicklung)
- `demo`
- `local`
- `aklow-local`
- `test-tenant`

**Option 2: Aus der Datenbank** (falls bereits vorhanden)
```sql
SELECT tenant_id FROM tenants;
```

**Option 3: Neuen Tenant erstellen** (in der Datenbank)
```sql
INSERT INTO tenants (tenant_id, business_name) 
VALUES ('mein-tenant', 'Mein Unternehmen');
```

### Wichtig:

- Die Tenant ID muss **in allen Memory-Operationen konsistent** verwendet werden
- Wenn du `ORCHESTRATOR_TENANT_ID=demo` setzt, müssen auch alle Memory-Speicherungen mit `tenant_id: "demo"` erfolgen
- Die Tenant ID wird an `/operator/inbox` geschickt und dann an das Memory-Backend weitergegeben

---

## Backends starten

### 1. Orchestrator Backend (Node.js)

```bash
cd Backend
npm run dev
```

Läuft auf: `http://localhost:4000`

### 2. Python Backend (FastAPI)

```bash
cd Backend/backend-agents
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Läuft auf: `http://127.0.0.1:8000`

### 3. Frontend (Next.js)

```bash
cd frontend
npm run dev
```

Läuft auf: `http://localhost:3000`

**Wichtig**: Nach Änderungen an `.env.local` muss der Next.js Server neu gestartet werden!

---

## Prüfen ob alles funktioniert

### 1. Inbox zeigt echte Daten?

Öffne: `http://localhost:3000`

- Klicke auf "Posteingang" in der Sidebar
- Die Warnung "ORCHESTRATOR_API_URL oder ORCHESTRATOR_TENANT_ID ist nicht gesetzt" sollte **nicht** mehr erscheinen
- Es sollten echte Daten aus dem Memory-Backend angezeigt werden (oder eine leere Liste, falls noch keine Daten vorhanden sind)

### 2. Memory funktioniert?

- Öffne "Speicher & CRM" in der Sidebar
- Kategorien sollten geladen werden (auch wenn Counts 0 sind)
- Beim Klicken auf eine Kategorie sollten Memory-Items angezeigt werden

### 3. ChatKit funktioniert?

- Schreibe eine Nachricht im Chat
- Die Nachricht sollte gespeichert werden (siehe Memory nach)

---

## Troubleshooting

### "ORCHESTRATOR_API_URL oder ORCHESTRATOR_TENANT_ID ist nicht gesetzt"

**Lösung**: 
1. Prüfe, ob `frontend/.env.local` existiert
2. Prüfe, ob beide Variablen gesetzt sind
3. **Starte den Next.js Dev-Server neu!**

### "MEMORY_API_SECRET is not configured"

**Lösung**: 
1. Prüfe, ob `MEMORY_API_SECRET` in allen drei `.env` Dateien gesetzt ist
2. Prüfe, ob der Wert in allen drei Dateien **identisch** ist

### "invalid_auth_token"

**Lösung 1** (Development):
```env
# In Backend/.env
AUTH_REQUIRE_SIGNED_TOKENS=false
```

**Lösung 2** (Production):
- Generiere einen gültigen Token: `AUTH_SECRET=... node scripts/generate-token.js demo`
- Trage den Token in `frontend/.env.local` ein

### Memory-API gibt 401/403 zurück

**Lösung**: 
- Prüfe, ob `MEMORY_API_SECRET` in Frontend, Orchestrator UND Python-Backend identisch ist
- Prüfe, ob das Python-Backend läuft (`http://127.0.0.1:8000`)

### Keine Daten in der Inbox

**Das ist normal**, wenn:
- Noch keine Memory-Einträge für diesen Tenant existieren
- Das Memory-Backend noch keine Daten hat

**Test**: Erstelle eine Chat-Nachricht, dann sollte sie im Memory erscheinen.

---

## Checkliste

- [ ] `setup-env.sh` ausgeführt ODER alle `.env` Dateien manuell erstellt
- [ ] `MEMORY_API_SECRET` in allen drei Dateien identisch
- [ ] `ORCHESTRATOR_API_URL` und `ORCHESTRATOR_TENANT_ID` im Frontend gesetzt
- [ ] Orchestrator Backend läuft (`http://localhost:4000`)
- [ ] Python Backend läuft (`http://127.0.0.1:8000`)
- [ ] Frontend läuft (`http://localhost:3000`)
- [ ] Next.js Dev-Server nach `.env.local` Änderungen neu gestartet
- [ ] Inbox zeigt keine Warnung mehr
- [ ] Memory-Modul funktioniert

---

## Nächste Schritte

1. ✅ Environment-Variablen sind gesetzt
2. ✅ Backends laufen
3. ✅ Frontend zeigt echte Daten

Jetzt kannst du:
- Chat-Nachrichten schreiben (werden im Memory gespeichert)
- Memory durchsuchen
- Inbox verwenden
- Alle anderen Features testen


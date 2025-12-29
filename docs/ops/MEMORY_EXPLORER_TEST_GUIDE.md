# MemoryExplorer Frontend Test Guide

## Übersicht

Der MemoryExplorer ist eine React-Komponente, die in `Settings → Database → Tab "Memory / Vektor"` angezeigt wird. Sie zeigt live Memory-Entries aus dem Python Backend an.

## Komponente

**Datei**: `src/components/settings/database/MemoryExplorer.tsx`

**Features**:
- ✅ Live-Daten via `/api/memory/list` und `/api/memory/search`
- ✅ Search-Funktion (semantische Suche)
- ✅ Filter nach MemoryKind und SourceType
- ✅ Archive/Delete Actions
- ✅ Pagination (Mehr laden)
- ✅ Ladezustände, Fehlerzustände, leere Zustände
- ✅ Zeigt `content_safe` (keine rohen Embeddings)
- ✅ Zeigt Metadaten (kind, type, tags, created_at)

## Manual Test Steps

### 1. Initial Load

1. Browser öffnen: `http://localhost:3000`
2. Login (falls nötig)
3. Navigiere zu: **Settings → Database → Tab "Memory / Vektor"**
4. **Erwartet**: 
   - Letzte 50 Memories werden geladen
   - Ladezustand wird angezeigt
   - Memories werden in Grid angezeigt

### 2. Search

1. In Search-Bar eingeben: `"E-Mail"`
2. Enter drücken
3. **Erwartet**:
   - Search-Request wird an `/api/memory/search` gesendet
   - Ergebnisse werden angezeigt
   - Score wird angezeigt (falls vorhanden)

### 3. Filter

1. **MemoryKind Filter**:
   - Dropdown "Alle Arten" → "Fakt" auswählen
   - **Erwartet**: Nur Memories mit `kind="fact"` werden angezeigt

2. **Source Filter**:
   - Dropdown "Alle Quellen" → "Chat" auswählen
   - **Erwartet**: Nur Memories mit `source_type="chat"` werden angezeigt

3. **Filter zurücksetzen**:
   - X-Button klicken
   - **Erwartet**: Alle Filter werden zurückgesetzt

### 4. Archive

1. Hover über ein Memory-Entry
2. Archive-Button (Orange) klicken
3. **Erwartet**:
   - Memory wird archiviert (Status ändert sich zu "archived")
   - Memory verschwindet aus der Liste (wenn Status-Filter aktiv ist)

### 5. Delete

1. Hover über ein Memory-Entry
2. Delete-Button (Rot) klicken
3. Bestätigung: "Memory wirklich löschen?" → OK

### 6. Vector Mirror Fields

1. Öffne Memory Explorer
2. **Erwartet**: 
   - Vector-Mirror-Sektion wird bei Items angezeigt (wenn vectors existieren)
   - Zeigt: vector_status, embedding_model, content_hash, vector_updated_at
   - Status-Badge zeigt "ready", "pending" oder "missing"

### 7. /memory Page

1. Navigiere zu `/memory`
2. **Erwartet**: 
   - Echte Daten werden geladen (nicht Demo)
   - Search funktioniert
   - Query-Parameter `/memory?query=...` funktioniert
   - Click auf Item öffnet MemoryDetailPanel

### 8. Authorization Header

1. Öffne Browser DevTools → Network Tab
2. Führe Memory-Operation aus (search, list, save, archive, delete)
3. **Erwartet**: 
   - Alle Requests zu `/api/memory/*` haben `Authorization: Bearer <token>` Header
   - Keine 401/tenant missing errors
4. **Erwartet**:
   - Memory wird gelöscht (Status ändert sich zu "deleted")
   - Memory verschwindet aus der Liste

### 6. Pagination

1. Scroll nach unten
2. "Mehr laden" Button klicken
3. **Erwartet**:
   - Weitere 50 Memories werden geladen
   - Button zeigt verbleibende Anzahl

### 7. Error Handling

1. Backend stoppen (oder falsche URL)
2. MemoryExplorer öffnen
3. **Erwartet**:
   - Fehlerzustand wird angezeigt
   - Fehlermeldung wird angezeigt

### 8. Empty State

1. Filter setzen, der keine Ergebnisse liefert
2. **Erwartet**:
   - "Keine Memories gefunden" wird angezeigt

## API Endpoints

Der MemoryExplorer nutzt folgende Frontend-API-Routes:

- **GET `/api/memory/list`**: Liste von Memories (paged)
- **POST `/api/memory/search`**: Semantische Suche
- **POST `/api/memory/archive`**: Memory archivieren
- **POST `/api/memory/delete`**: Memory löschen

Diese Routes sind Proxies zum Python Backend:
- `/api/memory/list` → `http://127.0.0.1:8000/memory/list`
- `/api/memory/search` → `http://127.0.0.1:8000/memory/search`
- `/api/memory/archive` → `http://127.0.0.1:8000/memory/archive`
- `/api/memory/delete` → `http://127.0.0.1:8000/memory/delete`

## Sicherheit

- ✅ Keine rohen Embedding-Vektoren werden angezeigt
- ✅ Nur `content_safe` wird angezeigt (falls vorhanden)
- ✅ Tenant-ID kommt aus Auth-Context (nicht aus Request-Body)
- ✅ API-Routes nutzen `MEMORY_API_SECRET` für Backend-Calls

## Known Issues / TODOs

- [ ] Keine offenen TODOs
- [ ] Alle Features implementiert

## Smoke Steps (Memory System 8/10 Go-Live)

### C2: "Memory works" Smoke Steps

**Ziel**: Verifizieren, dass Memory-System in Production-Mode funktioniert (keine 401 wegen fehlender Auth).

#### 1. Login
- Browser öffnen: `http://localhost:3000` (oder Production URL)
- Login durchführen
- **Erwartet**: Session erstellt, `auth_token` in localStorage

#### 2. Chat: Memory Retrieval
- Navigiere zu Chat
- Sende eine Nachricht, die relevant für existierende Memories ist
- **Erwartet**: 
  - Memory-Retrieval funktioniert (kein 401)
  - Memories werden im Context angezeigt (falls enabled)
  - Network-Tab zeigt: `/api/memory/search` mit `Authorization: Bearer <token>` Header

#### 3. Manual Save
- Im Chat: Nachricht senden
- Klicke "Save to Memory" Button (falls vorhanden) oder warte auf automatisches Speichern
- **Erwartet**:
  - Memory wird gespeichert
  - Kein 401/403 Fehler
  - Network-Tab zeigt: `/api/memory/save` mit `Authorization` Header

#### 4. Settings → Memory Explorer: List + Mirror Fields
- Navigiere zu: **Settings → Database → Tab "Memory / Vektor"**
- **Erwartet**:
  - Liste zeigt Memory-Items
  - Vector-Mirror-Felder werden angezeigt:
    - `vector_status` (ready/pending/missing)
    - `embedding_model` (z.B. "text-embedding-3-small")
    - `content_hash`
    - `vector_updated_at`
  - Keine 401/403 Fehler
  - Network-Tab zeigt: `/api/memory/list` mit `Authorization` Header

#### 5. /memory?query=... prüfen
- Navigiere zu: `/memory?query=test`
- **Erwartet**:
  - Seite lädt ohne Build-Errors
  - Echte Memories werden angezeigt (keine Demo-Daten)
  - Query-Parameter wird verwendet (vorgefilterte Results)
  - InlineChip "Ansehen" führt zu sinnvoller Anzeige
  - Network-Tab zeigt: `/api/memory/search` mit `Authorization` Header

### Quick Verification Checklist

- [ ] Chat: Memory-Retrieval funktioniert (kein 401)
- [ ] Chat: Manual Save funktioniert (kein 401)
- [ ] Memory Explorer: List zeigt Mirror-Felder
- [ ] /memory Seite: Baut ohne Fehler, zeigt echte Daten
- [ ] Alle `/api/memory/*` Requests haben `Authorization` Header
- [ ] Keine 401/403 Fehler in Production-Mode

## Filter Regression Tests

### Filter-Mapping bei Search (query != "")

**Problem**: Filter müssen bei Search-Requests (query gesetzt) identisch wie bei List-Requests (query leer) funktionieren.

**Test-Szenarien**:

1. **Search mit Filter - MemoryKind**:
   - Search-Bar: "test" eingeben
   - Filter "Fakt" auswählen
   - Enter drücken
   - **Erwartet**: Nur Memories mit `kind="fact"` werden in den Suchergebnissen angezeigt
   - **API-Check**: Request an `/api/memory/search` sollte `filters: { memory_kind: ["fact"] }` enthalten

2. **Search mit Filter - SourceType**:
   - Search-Bar: "email" eingeben
   - Filter "Posteingang" auswählen
   - Enter drücken
   - **Erwartet**: Nur Memories mit `source_type="inbox"` werden angezeigt
   - **API-Check**: Request an `/api/memory/search` sollte `filters: { source_type: ["inbox"] }` enthalten

3. **Search mit beiden Filtern**:
   - Search-Bar: "wichtig" eingeben
   - Filter "Fakt" + "Posteingang" auswählen
   - Enter drücken
   - **Erwartet**: Nur Memories mit `kind="fact"` UND `source_type="inbox"` werden angezeigt
   - **API-Check**: Request sollte beide Filter enthalten: `filters: { memory_kind: ["fact"], source_type: ["inbox"] }`

4. **Konsistenz-Check: List vs Search**:
   - Filter "Fakt" + "Posteingang" setzen
   - **List** (keine Query): Notiere die Anzahl der Ergebnisse
   - **Search** (Query: "test"): Ergebnisse sollten eine Teilmenge der List-Ergebnisse sein (gleiche Filter)

### Automatische Tests

**Location**: `src/app/api/memory/search/__tests__/route.test.ts`

**Test-Cases**:
- ✅ Maps `memoryKind` → `memory_kind`
- ✅ Maps `sourceType` → `source_type`
- ✅ Accepts canonical keys (`memory_kind`, `source_type`) directly
- ✅ Accepts legacy `types` key and maps to `memory_kind`
- ✅ Priority: `memory_kind` > `memoryKind` > `types`
- ✅ Priority: `source_type` > `sourceType`
- ✅ Filters are correctly passed to backend

**Ausführen**:
```bash
cd frontend
npm run test src/app/api/memory/search/__tests__/route.test.ts
```

### Filter-Schlüssel (Kanonisch)

**UI sendet** (nach Fix):
- `filters.memory_kind: string[]` (z.B. `["fact", "preference"]`)
- `filters.source_type: string[]` (z.B. `["inbox", "chat"]`)

**Backend erwartet**:
- `filters.memory_kind: string[]`
- `filters.source_type: string[]`

**Proxy akzeptiert** (für Rückwärtskompatibilität):
- `filters.memoryKind` → wird zu `memory_kind` gemappt
- `filters.sourceType` → wird zu `source_type` gemappt
- `filters.types` → wird zu `memory_kind` gemappt
- `filters.memory_kind` → wird direkt verwendet
- `filters.source_type` → wird direkt verwendet

## Troubleshooting

### Problem: Memories werden nicht geladen

**Prüfen**:
1. Browser Console öffnen (F12)
2. Network-Tab prüfen: Werden API-Calls gemacht?
3. Response prüfen: Gibt es Fehler?
4. Backend läuft? `curl http://127.0.0.1:8000/health`

### Problem: Search liefert keine Ergebnisse

**Prüfen**:
1. Gibt es Memories in der DB?
2. Ist der Query-String lang genug? (min. 3 Zeichen für Vector Search)
3. Backend-Logs prüfen: `tail -f logs/backend.log`

### Problem: Archive/Delete funktioniert nicht

**Prüfen**:
1. Ist `memoryId` korrekt?
2. Backend-Logs prüfen: Gibt es Permission-Errors?
3. Tenant-ID korrekt? (aus Auth-Context)

### Problem: Filter funktionieren bei Search nicht

**Symptom**: Filter funktionieren bei List (keine Query), aber nicht bei Search (Query gesetzt).

**Prüfen**:
1. Browser Console öffnen (F12) → Network-Tab
2. Search-Request prüfen: Enthält der Request-Body `filters`?
3. Filters-Struktur prüfen: Sollte `memory_kind` und/oder `source_type` als Arrays enthalten
4. Backend-Logs prüfen: Werden Filter im Backend empfangen?
5. **Fix**: Stelle sicher, dass UI kanonische Keys sendet (`memory_kind`, `source_type`), nicht `memoryKind`/`sourceType`

**API-Request-Beispiel (korrekt)**:
```json
{
  "query": "test",
  "limit": 20,
  "filters": {
    "memory_kind": ["fact"],
    "source_type": ["inbox"]
  }
}
```

**Common Issues**:
- ❌ UI sendet `memoryKind` statt `memory_kind` → Proxy mappt, aber UI sollte kanonisch senden
- ❌ Filter fehlen komplett im Request → UI-Logik prüfen
- ❌ Filter sind keine Arrays → Backend erwartet Arrays


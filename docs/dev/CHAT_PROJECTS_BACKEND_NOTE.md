# Chat & Projects Backend API - Referenz

## Übersicht
Dieses Dokument listet die vorhandenen Backend-Endpoints für Chat-Threads und Projekte auf, die für die Frontend-Integration relevant sind.

## Thread Endpoints (v2)

### GET /v2/threads
Listet Chat-Threads auf.

**Query-Parameter:**
- `tenantId` (string, required)
- `userId` (string, optional)
- `projectId` (string, optional) - Filtert Threads nach Projekt
- `archived` (boolean, default: false)
- `cursor` (string, optional) - Pagination
- `limit` (integer, 1-100, default: 20)

**Response:**
```typescript
{
  threads: Array<{
    threadId: string
    title: string
    projectId?: string
    archived: boolean
    pinned: boolean
    lastMessageAt: number
    preview?: string
    // ... weitere Felder
  }>
  cursor?: string
}
```

### GET /v2/threads/search
Sucht Threads nach Text.

**Query-Parameter:**
- `tenantId` (string, required)
- `userId` (string, optional)
- `q` (string, required) - Suchbegriff
- `limit` (integer, default: 20)

### POST /v2/threads
Erstellt einen neuen Thread.

**Body:**
```typescript
{
  tenantId: string
  userId?: string
  projectId?: string
  channel?: string
  title?: string
}
```

**Response:**
```typescript
{
  threadId: string
}
```

### PATCH /v2/threads/{threadId}
Aktualisiert einen Thread.

**Body:**
```typescript
{
  title?: string
  archived?: boolean
  pinned?: boolean
}
```

### GET /v2/threads/{threadId}/messages
Holt Nachrichten eines Threads.

**Query-Parameter:**
- `branchId` (string, optional) - Branch für Edit/Regenerate
- `includeNonCurrent` (boolean, optional) - Inkludiert alle Candidates

## Project Endpoints (v2)

### GET /v2/projects
Listet Projekte auf.

**Query-Parameter:**
- `tenantId` (string, required)
- `userId` (string, optional)

**Response:**
```typescript
{
  projects: Array<{
    id: string
    name: string
    instructions?: string
    files?: Array<{
      documentId: string
      filename: string
      mimeType?: string
      size?: number
      createdAt: number
    }>
    // ... weitere Felder
  }>
}
```

### POST /v2/projects
Erstellt ein neues Projekt.

**Body:**
```typescript
{
  tenantId: string
  userId?: string
  name: string
  instructions?: string
  isFolder?: boolean
  parentId?: string
}
```

**Response:**
```typescript
{
  id: string
  name: string
  // ... weitere Felder
}
```

### PATCH /v2/projects/{projectId}
Aktualisiert ein Projekt.

**Body:**
```typescript
{
  name?: string
  instructions?: string
}
```

### DELETE /v2/projects/{projectId}
Löscht ein Projekt.

**Query-Parameter:**
- `tenantId` (string, required)

### GET /v2/projects/{projectId}/threads
Holt alle Threads eines Projekts.

**Query-Parameter:**
- `tenantId` (string, required)

## Implementierungsstatus

**Aktuell (Stand: 2024):**
- Thread-Endpoints existieren im Python-Backend (`Backend/backend-agents/app/api/chat_api.py`)
- Project-Endpoints sind in der Planung dokumentiert (`Backend/backend-agents/docs/chatgpt_parity_plan.md`)
- Frontend nutzt aktuell lokale Stores (`chatThreadsStore.ts`, `projectsStore.ts`)

**Nächste Schritte:**
- Frontend-Stores auf Backend-API umstellen
- Project-Endpoints im Python-Backend implementieren (falls noch nicht vorhanden)
- Error-Handling und Offline-Fallback implementieren

## Referenzen

- Backend: `Backend/backend-agents/app/api/chat_api.py`
- Backend Routes: `Backend/src/routes/chat.ts`
- Frontend Stores: `frontend/src/lib/chatThreadsStore.ts`, `frontend/src/lib/projectsStore.ts`
- Planungsdokument: `Backend/backend-agents/docs/chatgpt_parity_plan.md`


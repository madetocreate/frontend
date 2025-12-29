# Entwicklungsstand - Repo-Scan

## Frontend - Dateien & Struktur

### Shell V2
- **Header**: `src/components/shell-v2/WorkspaceHeaderV2.tsx`
  - Links: Workspace-Titel + Command Input ("Was möchtest du erledigen?")
  - Rechts: Logo (SparklesIcon) + NotificationsDropdown + AvatarMenu
  - Command Palette via Cmd+K
- **Rail**: `src/components/shell-v2/WorkspaceRailV2.tsx`
- **Sidebar**: `src/components/shell-v2/WorkspaceSidebarV2.tsx`
- **AppShell**: `src/components/shell-v2/AppShellV2.tsx`

### Chat
- **Route**: `src/app/(workspaces)/chat/page.tsx` → `ChatWorkspaceRouter`
- **Router**: `src/features/chat/ChatWorkspaceRouter.tsx`
  - Routing: `mode=projects`, `project=<id>`, `thread=<id>`
  - Problem: Global Thread (threadId ohne projectId) zeigt ProjectsHome
- **Sidebar**: `src/features/chat/ChatSidebarV2.tsx`
  - `handleNewChat()` erstellt Thread, navigiert zu `/chat?thread=<id>`
  - `handleThreadSelect()` navigiert mit/ohne projectId
- **Project Thread**: `src/features/chat/projects/ProjectThread.tsx`
  - Back Button zu Project Hub
  - Nutzt `ChatViewport`
- **Store**: `src/lib/chatThreadsStore.ts`
  - localStorage keys: `aklow-active-thread-id`, `aklow-temporary-thread-ids`
  - `createChatThread()` erstellt neuen Thread
  - `setActiveThreadId()` setzt aktiven Thread

### Chat Composer
- **ChatShell**: `src/components/ChatShell.tsx`
  - Composer: textarea mit `inputRef`
  - `useComposerState()` Hook für State
- **Composer State**: `src/hooks/chat/useComposerState.ts`
  - input, attachments, isPlusMenuOpen, etc.

### Fast Action Button
- **Aktuell**: NICHT im Header gefunden (muss noch gesucht werden)
- **Suggestions Hook**: `src/lib/actions/suggestions.ts`
  - `useFastActionSuggestions()` Hook
  - Endpoint: `/api/fast-actions`
- **ActionBar**: `src/components/actions/ActionBar.tsx`
  - Nutzt `useFastActionSuggestions()`
  - Wird in InboxDetail verwendet

### Command Palette
- **Component**: `src/components/CommandPalette.tsx`
- **Input**: Im Header (`WorkspaceHeaderV2.tsx`), öffnet Command Palette bei Klick

### WorkLog
- **Storage**: `src/lib/worklog/storage.ts`
  - localStorage key: `aklow.v2.worklog`
  - `appendWorkLog()`, `loadWorkLog()`, `saveWorkLog()`
- **View**: `src/features/worklog/WorkLogView.tsx`

### Inbox Filter
- **Filtering**: `src/features/inbox/filtering.ts`
  - `applyInboxFilters()`: src, status, range
- **Types**: `src/features/inbox/types.ts`
  - `InboxSource`: 'email', 'telegram', 'reviews', 'website', 'phone'
  - `InboxStatus`: 'needs_action', 'open', 'archived'
- **Filters Panel**: `src/features/inbox/InboxFiltersPanel.tsx`

### Actions
- **Route**: `src/app/(workspaces)/actions/page.tsx`
  - Query Params: `cat`, `type`, `view`, `id`, `integration`
  - Views: Overview, Template Flow, Setup Integrations
- **Overview**: `src/features/actions/ActionsOverview.tsx`
- **Filtering**: `src/features/actions/filtering.ts`

## Backend - Endpoints & Struktur

### Actions Manifest
- **Datei**: `Backend/backend-agents/app/workflows/contracts/actions_manifest.json`
  - Core-10 Actions definiert
  - Schema: action_id, output_type, contract, requires_approval, ui

### FastActionAgent
- **Registry**: `Backend/backend-agents/fast_action_agent/registry.py`
  - ActionSpec: id, label_de/en, intent, handler, surfaces
  - DEFAULT_ACTIONS: summarize, next_steps, make_tasks, etc.
- **Agent**: `Backend/backend-agents/fast_action_agent/agent.py`
- **Endpoint**: `POST /api/fast-actions`
  - Request: surface, max_actions, language, last_user_message, etc.
  - Response: suggestions[]

### Actions API
- **Execute**: `POST /api/v1/actions/execute`
  - Request: tenant_id, session_id, action_id, context, config, stream
  - Response: SSE Stream (text/event-stream) oder JSON
- **Runs**: `GET /api/v1/actions/runs/{run_id}`
- **Input**: `POST /api/v1/actions/runs/{run_id}/input`
- **Implementation**: `Backend/backend-agents/app/api/actions_api.py`

### SSE Events
- Event Types: `run.started`, `run.progress`, `card_render`, `run.completed`, `run.failed`
- Format: `{ v:1, type, run_id, ts, payload }`

### Core Workflows
- **Core V2**: `Backend/backend-agents/app/workflows/packs/core_v2.py`

## localStorage Keys

### Chat
- `aklow-active-thread-id`: Aktiver Thread ID
- `aklow-temporary-thread-ids`: Array temporärer Thread IDs

### WorkLog
- `aklow.v2.worklog`: WorkLog Einträge (Array)

### Notifications
- (siehe `src/lib/notifications/system.ts`)

### Integrations
- (siehe `src/lib/integrations/storage.ts`)

### Memory
- `aklow_memory_demo`: Memory Items (Demo)
- `aklow_memory_demo_seeded`: Seed Flag

### Sidebar
- `aklow.v2.sidebar.open`: Sidebar Open State

### Command Palette
- (siehe `src/lib/cmdk/recent.ts`)

## Implementierte Fixes (Session)

### Block A: Chat Global vs Projekt-Modus ✅
- **GlobalThread.tsx** erstellt: Zeigt globale Threads ohne Projekt
- **ChatWorkspaceRouter.tsx** angepasst: Routing für globale Threads korrigiert
- **ProjectThread.tsx**: "Projekt verlassen" Button hinzugefügt
- **Composer Focus**: Bereits implementiert in ChatShell (handleNew Event)

### Block B: Header bereinigt ✅
- **WorkspaceHeaderV2.tsx**: Logo Button entfernt
- Header rechts zeigt jetzt nur: NotificationsDropdown + AvatarMenu

### Block C: Fast Action Button im Composer ✅
- **ChatShell.tsx**: Fast Action Button im Composer hinzugefügt
- Nur sichtbar wenn `suggestions.length > 0`
- Nutzt `useFastActionSuggestions` Hook
- AkPopoverMenu für Suggestions
- WorkLog Eintrag bei Klick auf Suggestion

### Block D: Assistenten-Übersicht ✅
- **AssistantsHub.tsx** erstellt: Übersicht für Website/Telefon/Review Bots
- **types.ts**: Kategorie "assistants" hinzugefügt
- **catalog.ts**: Assistenten-Kategorie hinzugefügt
- **actions/page.tsx**: Routing für `cat=assistants` implementiert
- Zeigt Status, Counts, Mini-Log, Quick Actions

## Implementierte Fixes (Block E - V1-Fundament) ✅

### Open-Loop Radar
- **OpenLoopsView.tsx** erstellt: `/actions?cat=ops&view=open_loops`
- Zeigt: needs_action Items, Unanswered (>24h), Promised Follow-ups
- Deep Links zu Inbox Items

### Impact Ledger
- **ImpactView.tsx** erstellt: `/actions?cat=ops&view=impact`
- Ableitung aus WorkLog: Beantwortet, Archiviert, Actions ausgeführt, Zeit gespart
- Heuristische Zeitberechnung (V1)

### Packs (Job-to-be-done Library)
- **PacksView.tsx** erstellt: `/actions?cat=packs`
- Demo-first Packs: Anfrage→Antwort, Reviews, Termine, Organisation
- Nutzt actions_manifest metadata (später)

### Autopilot Levels
- **autopilot.ts** erstellt: localStorage-basierte Prefs pro action_id
- Level 1: Vorschlagen / 2: Vorbereiten / 3: Ausführen
- Storage: `aklow.v2.autopilotPrefs[action_id]=level`

### Ask-the-Business
- Command Palette Commands hinzugefügt:
  - "Was hängt gerade?" → Open Loops View
  - "Was hat diese Woche geholfen?" → Impact View

## Security & Authentifizierung (Development)

### Security-Deaktivierung ⚠️
**Status**: ✅ Temporär deaktiviert für lokale Entwicklung  
**Dokumentation**: `docs/dev/SECURITY_DEV_MODE.md`

#### Geänderte Dateien
- **lib/server/tenant.ts**:
  - JWT-Verifizierung: Im Dev-Modus übersprungen
  - `getTenantIdFromRequest()`: Auto-Fallback zu `aklow-main` im Dev
  - `verifyAndExtractTenantIdFromAuthHeader()`: Gibt `null` im Dev zurück
  
- **app/api/memory/search/route.ts**:
  - 401-Check entfernt, verwendet Fallback-Tenant

#### Verhalten
- **Development** (`NODE_ENV !== 'production'`):
  - ✅ Keine JWT-Verifizierung
  - ✅ Automatischer Fallback zu `aklow-main`
  - ✅ Keine 401-Fehler
  - ✅ Alle API-Routes funktionieren ohne Auth

- **Production** (`NODE_ENV === 'production'`):
  - ✅ JWT-Verifizierung aktiv (HS256 + AUTH_SECRET)
  - ✅ Tenant-Authentifizierung erforderlich
  - ✅ 401-Fehler bei fehlender Auth
  - ✅ Service-to-Service Auth (INTERNAL_API_KEY)

#### Environment-Variablen
```bash
# Development (.env.local)
NODE_ENV=development
NEXT_PUBLIC_DEFAULT_TENANT_ID=aklow-main

# Production (.env)
NODE_ENV=production
AUTH_SECRET=<secure-secret>
INTERNAL_API_KEY=<secure-key>
```

#### Vor Deployment
- [ ] `NODE_ENV=production` setzen
- [ ] `AUTH_SECRET` konfigurieren
- [ ] `INTERNAL_API_KEY` setzen
- [ ] Frontend Auth-Flow implementieren
- [ ] Security-Tests durchführen

## Offene Punkte

- Block F: Smoke Tests - noch nicht durchgeführt (Build läuft, aber CustomerEventCard.tsx hat unabhängigen Type-Fehler)


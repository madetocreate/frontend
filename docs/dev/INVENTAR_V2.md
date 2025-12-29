# AKLOW V2 Inventar - Repo-Scan & Status

**Stand:** 2024-12-19  
**Zweck:** Übersicht über vorhandene Komponenten, Endpoints, Event-Formate für V2 Finalisierung

---

## Frontend - Komponenten & Struktur

### V2 Shell
- **AppShellV2** (`src/components/shell-v2/AppShellV2.tsx`)
  - Layout: Rail + Header + Sidebar + Main
  - Persistenz: `aklow.v2.sidebar.open` (localStorage)
  
- **WorkspaceRailV2** (`src/components/shell-v2/WorkspaceRailV2.tsx`)
  - Links: Workspace-Icons (Inbox, Docs, Actions, Customers, Chat, Settings)
  - Fixed width: 68px
  
- **WorkspaceHeaderV2** (`src/components/shell-v2/WorkspaceHeaderV2.tsx`)
  - Title (workspace.label)
  - Command Bar Input (öffnet Command Palette)
  - Logo Button
  - NotificationsDropdown
  - AvatarMenu
  
- **WorkspaceSidebarV2** (`src/components/shell-v2/WorkspaceSidebarV2.tsx`)
  - Workspace-spezifische Navigation
  - Filter Row + Filter Overlay
  - Sidebar Items (workspace.sidebarItems)

### Command Palette
- **CommandPalette** (`src/components/CommandPalette.tsx`)
  - ⌘K Trigger (WorkspaceHeaderV2)
  - Kategorien: navigation, action, search, settings
  - Aktuelle Commands: Navigation (6), Actions (3)
  - Keyboard: Arrow keys, Enter, Escape
  - **TODO**: Recent Commands fehlt

### Notifications System
- **NotificationsDropdown** (`src/components/shell-v2/NotificationsDropdown.tsx`)
  - Storage: `aklow.v2.notifications` (localStorage)
  - Model: `SystemNotification { id, title, body?, ts, read, level? }`
  - Features: Unread badge, Mark all read, Demo-Seed
  - **TODO**: Event Hooks (Action completed/failed), actionLink Navigation

### Chat Workspace
- **ChatWorkspaceShell** (`src/components/ChatWorkspaceShell.tsx`)
  - Workbench Pane + Chat Pane
  - Command Palette Integration
  - Bell Icon (Notification Center)
  
- **ChatSidebarV2** (`src/features/chat/ChatSidebarV2.tsx`)
  - Project/Thread Navigation
  - localStorage: `aklow-active-thread-id`

### WorkLog
- **Storage** (`src/lib/worklog/storage.ts`)
  - Key: `aklow.v2.worklog`
  - Functions: loadWorkLog(), saveWorkLog(), appendWorkLog()
  
- **Types** (`src/lib/worklog/types.ts`)
  - WorkLogEntry: { id, ts, type, channel, title, detail?, ref? }
  - Types: ingress, suggestion, executed, setup
  
- **View** (`src/features/worklog/WorkLogView.tsx`)
  - Gruppierung: today, yesterday, older
  - Filtering Support

### Empty/Loading/Error States
- **AkEmptyState** (`src/components/ui/AkEmptyState.tsx`) ✅
  - Props: title, description, icon, action, secondaryAction
  - Wird bereits in InboxEmptyState genutzt
  
- **AkErrorState** (`src/components/ui/AkErrorState.tsx`) ✅
  - Basiert auf AkEmptyState
  - Retry Support

### Design Tokens
- **ak-tokens.css** (`src/app/ak-tokens.css`)
  - Surface Levels (0-3)
  - Colors: Text, Accents (pro Bereich), Semantic
  - Motion (fast/base/slow)
  - Focus Ring: `--ak-focus-ring-color` = `var(--ak-color-accent-soft)`
  - **TODO**: Graphite Tokens für neutralen Focus Ring
  
- **ak-interactions.css** (`src/app/ak-interactions.css`)
  - `.ak-focus-ring`: `focus-visible:ring-2` (bereits korrekt!)
  - **TODO**: Blue hardcodes in Komponenten entfernen

### Actions Integration (Frontend)
- **client.ts** (`src/lib/actions/client.ts`)
  - `startAction()` → `run_id`
  - `startActionWithStream()` → SSE Stream
  - `subscribeToRun()` → **STUB** (noch nicht implementiert)
  
- **InboxDetail** (`src/features/inbox/InboxDetail.tsx`)
  - Fast Actions Suggestions (`useFastActionSuggestions`)
  - Action Running Card (`ActionRunningCard`)
  - Result Card Renderer (`ActionResultCardRenderer`)
  - WorkLog Integration (appendWorkLog)
  - **TODO**: Notification bei completed/failed

---

## Backend - Actions & SSE

### Actions Manifest
- **actions_manifest.json** (`Backend/backend-agents/app/workflows/contracts/actions_manifest.json`)
  - Core-10 Actions definiert:
    - inbox.draft_reply, inbox.ask_missing_info, inbox.summarize
    - inbox.next_steps, inbox.prioritize
    - crm.link_to_customer
    - documents.extract_key_fields, documents.summarize
    - reviews.draft_review_reply
    - website.fetch_and_profile

### FastActionAgent
- **agent.py** (`Backend/backend-agents/fast_action_agent/agent.py`)
  - `_get_allowed_action_ids()`: Lädt aus manifest_loader (Core-10)
  - Fallback: Hardcoded Core-10 + Aliases
  - `suggest()`: Surface-basiert, intent scoring
  
- **manifest_loader.py** (`Backend/backend-agents/app/actions/manifest_loader.py`)
  - `get_all_actions()`: Lädt actions_manifest.json
  - `get_allowed_action_ids()`: Core-10 + Legacy Aliases

### Actions API
- **actions_api.py** (`Backend/backend-agents/app/api/actions_api.py`)
  - `POST /api/v1/actions/execute`: Start Action Run
    - Request: { tenant_id, session_id, action_id, context, config, stream }
    - Response: SSE Stream (text/event-stream)
  - `GET /api/v1/actions/manifest`: Read-only Manifest
  - `GET /api/v1/actions/runs/{run_id}`: Run Status

### SSE Event Stream
- **stream_workflow_events()** (`Backend/backend-agents/app/api/actions_api.py`)
  - Versioned Envelope: `{ v:1, type, run_id, ts, payload }`
  - Event Types:
    - `run.started`
    - `run.progress`
    - `card_render` (output_type = draft/summary/tasks/extraction)
    - `run.completed`
    - `run.failed` (error_code, message, debug_id?)
  - Keepalive: alle 15-30s
  - Timeout: 10 min (configurable via `ACTION_RUN_MAX_DURATION_MINUTES`)
  - Resume: `Last-Event-ID` Header unterstützt

### Actions Registry
- **registry.py** (`Backend/backend-agents/app/actions/registry.py`)
  - ACTION_WORKFLOW_MAPPING: action_id → workflow_id
  - Fail-closed: Nur erlaubte Actions aus Manifest

### Core Workflows
- **core_v2.py** (`Backend/backend-agents/app/workflows/packs/core_v2.py`)
  - 10 Workflows (entsprechend Core-10 Manifest)

---

## Endpoints (Zusammenfassung)

### Frontend → Backend (via Gateway `/api/actions/*`)
- `POST /api/actions/execute`
  - Proxy zu `POST /api/v1/actions/execute`
  - SSE Stream Response
  
- `GET /api/actions/manifest` (wenn vorhanden)
  - Proxy zu `GET /api/v1/actions/manifest`

- `POST /api/fast-actions`
  - FastActionAgent Suggestions
  - Request: { surface, max_actions, allowed_action_ids, context }
  - Response: { suggestions: [...], meta }

### Backend Direct (Python FastAPI)
- `POST /api/v1/actions/execute`
- `GET /api/v1/actions/runs/{run_id}`
- `GET /api/v1/actions/manifest`

---

## Event-Formate

### SSE Event Envelope (v=1)
```json
{
  "v": 1,
  "type": "run.completed",
  "run_id": "run-123",
  "ts": "2024-12-19T10:30:00Z",
  "payload": {
    "action_id": "inbox.draft_reply",
    "result": { ... }
  }
}
```

### ActionEvent (Frontend)
```typescript
type ActionEvent = 
  | { type: 'run_started', run_id: string, action_id: string }
  | { type: 'step_progress', run_id: string, step: string, progress?: number }
  | { type: 'card_render', run_id: string, card: Record<string, unknown> }
  | { type: 'run_completed', run_id: string, result?: unknown }
  | { type: 'run_failed', run_id: string, error_code: string, message: string, debug_id?: string }
```

---

## Storage Keys (localStorage)

- `aklow.v2.sidebar.open` (boolean)
- `aklow.v2.notifications` (SystemNotification[])
- `aklow.v2.worklog` (WorkLogEntry[])
- `aklow.v2.integrations` (Integration[])
- `aklow.v2.settings.*` (Settings)
- `aklow.v2.inbox.demo` (boolean)
- `aklow-active-thread-id` (string)
- `aklow-active-project-id` (string) - **TODO**: Prüfen ob vorhanden

---

## TODOs für Finalisierung

### UX/Accessibility (Block A)
- [ ] focus → focus-visible überall (grep nach `focus:ring-*`, `focus:outline-*`)
- [ ] Escape schließt Dropdowns/Palette
- [ ] Empty States konsistent (AkEmptyState nutzen)
- [ ] Persistenz: lastWorkspace, chat state

### Command Palette (Block B)
- [ ] Recent Commands (localStorage: `aklow.v2.cmdk.recent`)
- [ ] Quick Actions erweitern ("Inbox aufräumen", etc.)

### Notifications (Block C)
- [ ] Event Hooks: Action completed/failed → System Notification
- [ ] actionLink Navigation in Notification

### Designsystem (Block D)
- [ ] Blue hardcodes entfernen (grep nach `bg-blue-*`, `text-blue-*`, `ring-blue-*`)
- [ ] Graphite Focus Ring Token (`--ak-focus-ring` = graphite)

### Actions E2E (Block E)
- [ ] Backend: FastActionAgent Core-10 parity verifizieren
- [ ] SSE Contract: Keepalive, Timeout, Error Handling testen
- [ ] Frontend: subscribeToRun() implementieren (optional, da startActionWithStream vorhanden)
- [ ] InboxDetail: Notification bei completed/failed
- [ ] Tests: Backend + Frontend Parser

### Integrations (Block F)
- [ ] Mock Connector (localStorage-based)
- [ ] Schema: `aklow.v2.integrations` finalisieren
- [ ] Setup Flows in `/actions?cat=setup`


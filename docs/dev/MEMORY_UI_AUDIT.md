# Memory UI Audit - Vorher-Inspektion

**Datum**: 2024-12-XX  
**Ziel**: Memory sauber in V2 Settings integrieren, Doppel-Views entfernen

## 1. Frontend Memory-Stellen

### 1.1 Legacy UI (alte Shell / alte Settings)

| Datei | Beschreibung | Status |
|-------|--------------|--------|
| `src/app/memory/page.tsx` | Vollständige Memory-Explorer-Seite mit ChatWorkspaceShell | ❌ **ZU ENTFERNEN/UMLEITEN** |
| `src/components/settings/database/MemoryExplorer.tsx` | Memory-Explorer als Tab in Settings Database | ⚠️ **ZU ENTFERNEN** (wird durch V2 ersetzt) |
| `src/components/settings/SettingsDatabase.tsx` | Tab 'memory' mit MemoryExplorer | ⚠️ **ZU ENTFERNEN** (Tab 'memory') |

### 1.2 V2 UI (neue Shell)

| Datei | Beschreibung | Status |
|-------|--------------|--------|
| `src/components/settings/SettingsSidebarWidget.tsx` | View 'memory' existiert bereits | ✅ **BEREITS VORHANDEN** |
| `src/components/settings/SettingsDashboard.tsx` | View 'memory' rendert StorageShell | ⚠️ **ZU ERSETZEN** (neue MemorySettings) |
| `src/app/(workspaces)/settings/page.tsx` | V2 Settings Page - hat noch keinen 'memory' Tab | ❌ **FEHLT** |
| `src/components/shell-v2/workspaces.ts` | Settings Sidebar Items - hat noch keinen 'memory' Eintrag | ❌ **FEHLT** |

### 1.3 Backend API Clients / Services

| Datei | Beschreibung | Status |
|-------|--------------|--------|
| `src/lib/memoryClient.ts` | Memory API Client mit Auth | ✅ **BEREITS VORHANDEN** |
| `src/app/api/memory/list/route.ts` | Next.js Route → Backend `/memory/list` | ✅ **BEREITS VORHANDEN** |
| `src/app/api/memory/search/route.ts` | Next.js Route → Backend `/memory/search` | ✅ **BEREITS VORHANDEN** |
| `src/app/api/memory/save/route.ts` | Next.js Route → Backend `/memory_compat/save` | ✅ **BEREITS VORHANDEN** |
| `src/app/api/memory/archive/route.ts` | Next.js Route → Backend `/memory/archive` | ✅ **BEREITS VORHANDEN** |
| `src/app/api/memory/delete/route.ts` | Next.js Route → Backend `/memory/delete` | ✅ **BEREITS VORHANDEN** |

### 1.4 Weitere Memory-Komponenten

| Datei | Beschreibung | Status |
|-------|--------------|--------|
| `src/components/MemoryDetailPanel.tsx` | Detail-Panel für Memory | ✅ **KANN WIEDERVERWENDET WERDEN** |
| `src/modules/settings/storage/StorageShell.tsx` | Wird aktuell für 'memory' View verwendet | ⚠️ **ZU ERSETZEN** |
| `src/components/chat/markdown/MemoryInlineChip.tsx` | Link zu `/memory?query=...` | ⚠️ **ZU UPDATEN** (auf `/settings?tab=memory&id=...`) |

## 2. Backend-Endpunkte

### 2.1 Gefundene Endpunkte

| Endpoint | Method | Beschreibung | Response Format |
|----------|--------|--------------|-----------------|
| `/api/memory/list` | GET | Liste von Memories (paged) | `{ items: MemoryEntry[], total: number }` |
| `/api/memory/search` | POST | Semantische Suche | `{ items: MemoryEntry[], total?: number }` |
| `/api/memory/save` | POST | Memory speichern | `unknown` |
| `/api/memory/archive` | POST | Memory archivieren | `void` |
| `/api/memory/delete` | POST | Memory löschen | `void` |

### 2.2 MemoryEntry Felder (aus MemoryExplorer.tsx)

```typescript
interface MemoryEntry {
  id: string
  kind: string              // 'fact' | 'preference' | 'instruction' | 'summary' | 'note'
  type: string               // 'chat' | 'inbox' | 'doc' | 'manual' | 'system'
  content: string
  content_safe?: string
  tags?: string[]
  status: string             // 'active' | 'archived'
  created_at: string
  updated_at?: string
  metadata?: Record<string, unknown>
  entity_refs?: Record<string, string>
  confidence?: string
  score?: number
  // Vector Mirror fields (optional)
  vector_status?: string | null
  embedding_model?: string | null
  embedding_dim?: number | null
  vector_last_id?: number | null
  content_hash?: string | null
  vector_updated_at?: string | null
  drift_status?: string | null
}
```

### 2.3 Entscheidung: Backend-Endpunkte

✅ **Wir nutzen die bestehenden Endpunkte**:
- `/api/memory/list` für Liste
- `/api/memory/search` für Suche
- `/api/memory/archive` für Archivieren
- `/api/memory/delete` für Löschen

**V1 Demo**: Optional localStorage-Fallback für Demo-Mode, falls Backend nicht verfügbar.

## 3. Links zu Memory-Routen

### 3.1 Gefundene Links

| Datei | Link | Ziel | Status |
|-------|------|------|--------|
| `src/components/chat/markdown/MemoryInlineChip.tsx` | `/memory?query=${id}` | Alte Memory-Seite | ⚠️ **ZU UPDATEN** |

## 4. Entscheidungen

### 4.1 Zu entfernen/umleiten:
1. ❌ `/app/memory/page.tsx` → Redirect zu `/settings?tab=memory`
2. ❌ `SettingsDatabase.tsx` Tab 'memory' → Entfernen
3. ⚠️ `MemoryExplorer.tsx` → Kann als Referenz bleiben, wird aber nicht mehr verwendet
4. ⚠️ `StorageShell.tsx` für 'memory' View → Ersetzen durch neue MemorySettings

### 4.2 Zu erstellen:
1. ✅ `src/features/memory/types.ts` - Memory Types
2. ✅ `src/features/memory/storage.ts` - localStorage Demo (optional)
3. ✅ `src/features/memory/api.ts` - API Wrapper (optional, kann memoryClient.ts nutzen)
4. ✅ `src/features/memory/MemorySettings.tsx` - Haupt-UI (Liste + Filter)
5. ✅ `src/features/memory/MemoryDetail.tsx` - Detail-Ansicht
6. ✅ V2 Settings Tab 'memory' in `workspaces.ts` und `settings/page.tsx`

### 4.3 Zu aktualisieren:
1. ⚠️ `MemoryInlineChip.tsx` → Link auf `/settings?tab=memory&id=...`
2. ✅ `SettingsDashboard.tsx` → View 'memory' auf neue MemorySettings umstellen
3. ✅ `WorkspaceSidebarV2.tsx` → Tab 'memory' in activeItem-Logik aufnehmen

## 5. V2 Pattern Compliance

✅ **AkListRow**: Für Memory-Liste  
✅ **AkBadge**: Für Typ/Quelle/Status  
✅ **AkEmptyState**: Für leere Liste  
✅ **Variante A**: Liste → Detail (Main ersetzt sich), kein Right Pane  
✅ **Filter im Main**: Ruhige Controls, nicht als Sidebar-Filterpattern


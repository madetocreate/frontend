# Frontend Actions Integration - Dokumentation

## Übersicht

Das Frontend nutzt jetzt ein einheitliches Action-System, das alle KI-Aktionen über Backend-Workflows ausführt. Statt Prompts im Chat zu prefills, starten Actions sofort einen Run und führen den User Schritt für Schritt.

## Architektur

```
User Click (KI-Button)
    │
    ▼
dispatch('aklow-action-start')
    │
    ▼
ChatShell Event Handler
    │
    ▼
ActionRunClient.startRun()
    │
    ▼
POST /api/actions/execute
    │
    ▼
Node Gateway → Python Backend
    │
    ▼
SSE Stream Events
    │
    ▼
ChatShell rendert:
  - Assistant Messages
  - Pills (max 3 + Mehr)
  - Progress Updates
```

## Action Start System

### Kanonischer Weg: `dispatchActionStart`

**WICHTIG**: Alle UI-Komponenten müssen Actions ausschließlich über `dispatchActionStart` aus `@/lib/actions/dispatch` starten.

```typescript
import { dispatchActionStart } from '@/lib/actions/dispatch'

// Beispiel: Inbox Action starten
dispatchActionStart(
  'inbox.draft_reply',  // ActionId aus ACTION_REGISTRY
  {
    module: 'inbox',
    target: {
      id: 'thread-123',
      type: 'inbox',
      title: 'Kundenanfrage',
    },
    moduleContext: {
      inbox: {
        itemId: 'thread-123',
        threadId: 'thread-123',
        channel: 'email',
      },
    },
  },
  undefined,  // config optional
  'ActionBar'  // source für Debugging
)
```

### Action IDs

Alle Action IDs müssen aus `ACTION_REGISTRY` (`@/lib/actions/registry`) stammen. Die Registry enthält die kanonischen IDs im Format `module.action_name` (snake_case).

**Core-10 Actions (kanonisch, executable):**
- `inbox.summarize`
- `inbox.draft_reply`
- `inbox.ask_missing_info`
- `inbox.next_steps`
- `inbox.prioritize`
- `crm.link_to_customer`
- `documents.extract_key_fields`
- `documents.summarize`
- `reviews.draft_review_reply`
- `website.fetch_and_profile`

Legacy Aliases (werden vor Ausführung normalisiert):
- `inbox.draftReply` → `inbox.draft_reply`
- `inbox.nextSteps` → `inbox.next_steps`
- `documents.extractKeyFields` → `documents.extract_key_fields`

### UI Action Mapping

UI-Komponenten (AIActions, QuickActions) verwenden interne IDs, die über `quickActionToActionMapping.ts` auf kanonische Action IDs gemappt werden:

```typescript
import { mapUIActionToActionId } from '@/lib/quickActionToActionMapping'

// UI Action ID -> Action ID
const actionId = mapUIActionToActionId('reply', 'inbox')
// Returns: 'inbox.draft_reply'
```

### Wo werden Actions gestartet?

1. **ActionBar**: Registry-driven, generiert Buttons aus ACTION_REGISTRY (siehe `docs/ACTIONS_UI.md`)
2. **AIActions**: UI Action IDs werden über Mapping zu Action IDs konvertiert
3. **QuickActions**: QuickAction IDs werden zentral in `ChatWorkspaceShell` gemappt
4. **ChatFirstFAB**: Direkt via `dispatchActionStart`
5. **Andere Komponenten**: Immer über `dispatchActionStart` aus `@/lib/actions/dispatch`

### Legacy Support

`@/lib/events/dispatch` ist ein Wrapper für Kompatibilität und leitet intern an `@/lib/actions/dispatch` weiter. Neue Komponenten sollten direkt `@/lib/actions/dispatch` verwenden.

## ActionRunClient

**Datei:** `src/lib/actionRuns/client.ts`

### `startRun()`

Startet einen Action Run und streamt Events:

```typescript
import { startRun, type ActionRunEvent } from '@/lib/actionRuns/client'

const result = await startRun(
  {
    actionId: 'inbox.draftReply',
    context: {
      module: 'inbox',
      target: {
        id: 'thread-123',
        type: 'inbox_thread',
        title: 'Kundenanfrage',
      },
    },
    config: {
      tone: 'professionell',
    },
    stream: true,
  },
  (event: ActionRunEvent) => {
    // Handle events
    switch (event.type) {
      case 'run.started':
        console.log('Run started:', event.data.run_id)
        break
      case 'assistant.message':
        // Update UI with message
        setMessage(event.data.text)
        // Show pills if provided
        if (event.data.pills) {
          setPills(event.data.pills)
        }
        break
      case 'user_input.requested':
        // Show pills for user input
        setPills(event.data.pills)
        setRunState('WAITING_INPUT')
        break
      case 'run.completed':
        console.log('Run completed:', event.data.result)
        break
      case 'run.failed':
        console.error('Run failed:', event.data.error)
        break
    }
  }
)
```

### `sendInput()`

Sendet User Input an einen laufenden Run:

```typescript
import { sendInput } from '@/lib/actionRuns/client'

// String input
await sendInput(runId, 'formal')

// Pill object
await sendInput(runId, {
  id: 'formal',
  label: 'Formell',
  value: 'formal',
  kind: 'tone',
})
```

### `getRunStatus()`

Holt den Status eines Runs:

```typescript
import { getRunStatus } from '@/lib/actionRuns/client'

const status = await getRunStatus(runId)
// { runId, status, result, error }
```

## ChatShell Integration

### Event Handler

ChatShell hört auf `aklow-action-start`:

```typescript
const handleActionStart = async (e: Event) => {
  const detail = (e as CustomEvent).detail
  
  // 1. Optional: User message erstellen
  const userMessage: ChatMessage = {
    id: `action-user-${Date.now()}`,
    role: 'user',
    text: actionLabel, // z.B. "Antwortentwurf"
  }
  
  // 2. Assistant message für Run
  const assistantMessage: ChatMessage = {
    id: `action-assistant-${Date.now()}`,
    role: 'assistant',
    text: '',
    runState: 'RUNNING',
  }
  
  // 3. Run starten
  await startRun({...}, (event) => {
    // Update assistant message based on events
    setMessages(prev => {
      // Update message with event data
    })
  })
}
```

### Pills Rendering

Pills werden in Assistant Messages gerendert:

```tsx
{message.pills && message.pills.length > 0 && (
  <div className="mt-4 w-full">
    {message.step && (
      <div className="text-xs text-gray-500 mb-2">
        {message.step} {/* z.B. "Schritt 1/5" */}
      </div>
    )}
    <Pills
      pills={message.pills}
      onPillClick={async (pill) => {
        if (message.runId && message.runState === 'WAITING_INPUT') {
          await sendInput(message.runId, pill)
          // Update message state
        }
      }}
      maxVisible={3}
    />
  </div>
)}
```

## Pills Komponente

**Datei:** `src/components/chat/Pills.tsx`

### Props

```typescript
interface PillsProps {
  pills: Pill[]                    // Array von Pills
  onPillClick: (pill: Pill) => void // Callback beim Klick
  maxVisible?: number              // Max sichtbare Pills (default: 3)
  className?: string               // Zusätzliche CSS-Klassen
}

interface Pill {
  id: string                       // Eindeutige ID
  label: string                    // Anzeige-Text
  value: string                    // Wert der gesendet wird
  kind?: string                    // Optional: Art der Pill
}
```

### Verwendung

```tsx
import { Pills } from '@/components/chat/Pills'

<Pills
  pills={[
    { id: 'formal', label: 'Formell', value: 'formal' },
    { id: 'friendly', label: 'Freundlich', value: 'friendly' },
    { id: 'casual', label: 'Locker', value: 'casual' },
    { id: 'professional', label: 'Professionell', value: 'professional' },
  ]}
  onPillClick={(pill) => {
    console.log('Pill clicked:', pill.value)
    // Send input to run
  }}
  maxVisible={3}
/>
```

### Verhalten

- Zeigt max. `maxVisible` Pills (default: 3)
- Wenn mehr Pills vorhanden: "Mehr" Button
- "Mehr" klicken: Zeigt alle Pills + "Weniger" Button
- Pill klicken: Ruft `onPillClick` auf

## Action Registry

**Datei:** `src/lib/actions/registry.ts`

Die `ACTION_REGISTRY` ist die Single Source of Truth für alle verfügbaren Actions. Jede Action ID muss hier registriert sein.

```typescript
export const ACTION_REGISTRY: Record<ActionId, ActionDefinition> = {
  // Core-7 Actions (kanonisch, snake_case)
  'inbox.summarize': def('inbox.summarize', 'Posteingang zusammenfassen', 'inbox', 'summary'),
  'inbox.draft_reply': def('inbox.draft_reply', 'Antwortentwurf', 'inbox', 'draft'),
  'inbox.ask_missing_info': def('inbox.ask_missing_info', 'Rückfragen', 'inbox', 'draft'),
  'inbox.next_steps': def('inbox.next_steps', 'Nächste Schritte', 'inbox', 'tasks'),
  
  // Legacy IDs (für Kompatibilität, werden normalisiert)
  'inbox.draftReply': def('inbox.draftReply', 'Antwortentwurf', 'inbox', 'draft'),
  // ...
}
```

### Action ID Format

- **Kanonisch**: `module.action_name` (snake_case), z.B. `inbox.draft_reply`
- **Legacy**: CamelCase wird automatisch normalisiert, z.B. `inbox.draftReply` → `inbox.draft_reply`

### Quick Actions Mapping

**Datei:** `src/lib/quickActionToActionMapping.ts`

Mappt UI Action IDs und QuickAction IDs zu kanonischen Action IDs:

```typescript
// QuickAction ID -> Action ID
'inbox_summary' → 'inbox.summarize'
'reply_suggestion' → 'inbox.draft_reply'
'document_analysis' → 'documents.extract_key_fields'

// UI Action ID -> Action ID
'reply' → 'inbox.draft_reply'
'summarize' → 'inbox.summarize'
'extract-tasks' → 'inbox.next_steps'
```

### Validierung

In Development-Mode validiert `dispatchActionStart` automatisch gegen die Registry:
- Unbekannte Action IDs → Warnung mit ähnlichen Vorschlägen
- Kein Crash in Production

## Quick Actions

QuickActions sind UI-Shortcuts, die automatisch in Action Runs umgewandelt werden.

### Zentraler Listener

`ChatWorkspaceShell` hat einen zentralen Listener für QuickActions:

```typescript
// Automatisch in ChatWorkspaceShell
subscribeQuickAction((payload) => {
  const actionId = mapUIActionToActionId(payload.id)
  if (actionId) {
    dispatchActionStart(actionId, { module: actionId.split('.')[0] }, undefined, `QuickAction:${payload.source}`)
  }
})
```

### QuickAction Flow

1. User klickt QuickAction Button
2. `emitQuickAction({ id: 'inbox_summary', source: 'ChatShell' })`
3. Zentraler Listener in `ChatWorkspaceShell` empfängt Event
4. Mapping zu Action ID: `inbox_summary` → `inbox.summarize`
5. `dispatchActionStart('inbox.summarize', ...)` wird aufgerufen
6. Action Run startet → Card Output

**Wichtig**: QuickActions starten IMMER Action Runs, keine Prompt-Prefills mehr.

## Migration Guide

### Vorher: Prefill Chat

```typescript
// ❌ Alt
window.dispatchEvent(new CustomEvent('aklow-prefill-chat', {
  detail: {
    prompt: 'Schreibe eine professionelle Antwort',
    context: 'inbox',
  },
}))
```

### Nachher: Action Start (kanonisch)

```typescript
// ✅ Neu
import { dispatchActionStart } from '@/lib/actions/dispatch'

dispatchActionStart(
  'inbox.draft_reply',
  {
    module: 'inbox',
    target: { id: 'thread-123', type: 'inbox' },
  },
  undefined,
  'MyComponent'
)
  detail: {
    actionId: 'inbox.draftReply',
    context: {
      module: 'inbox',
      target: {
        id: threadId,
        type: 'inbox_thread',
      },
    },
  },
}))
```

### ChatFirstFAB

**Vorher:**
```typescript
const CONTEXT_ACTIONS = {
  inbox: [
    { id: 'reply', label: 'Antwort schreiben', prompt: '...' },
  ],
}
```

**Nachher:**
```typescript
const CONTEXT_ACTIONS = {
  inbox: [
    { id: 'reply', label: 'Antwort schreiben', actionId: 'inbox.draftReply' },
  ],
}
```

### AIActionWizard

**Vorher:** Wizard führt Action aus und zeigt Result im Wizard.

**Nachher:** Wizard startet Action Run und schließt sofort. Result erscheint im Chat.

## Best Practices

1. **Immer action_id verwenden**: Nie Prompts direkt senden
2. **Kontext reichhaltig**: So viel Kontext wie möglich mitgeben (target, moduleContext, etc.)
3. **Pills limitieren**: Max. 3 wichtigste Pills, Rest über "Mehr"
4. **Error Handling**: Immer try/catch um Action Runs
5. **Loading States**: Zeige Loading-Indicator während Run läuft

## Troubleshooting

### Run startet nicht

- Prüfe: Wird `aklow-action-start` Event korrekt dispatcht?
- Prüfe: Ist `actionId` in ACTION_REGISTRY vorhanden?
- Prüfe: Backend-Logs für Fehler

### Pills werden nicht angezeigt

- Prüfe: Kommt `user_input.requested` Event?
- Prüfe: Ist `message.pills` Array gesetzt?
- Prüfe: Ist `runState === 'WAITING_INPUT'`?

### Input wird nicht gesendet

- Prüfe: Ist `runId` gesetzt?
- Prüfe: Ist `runState === 'WAITING_INPUT'`?
- Prüfe: Backend-Logs für Signal-Empfang

## API Routes (Next.js)

### `/api/actions/execute`

Proxyt zu Node Gateway `/actions/execute`.

### `/api/actions/runs/[runId]/input`

Proxyt zu Node Gateway `/actions/runs/:id/input`.

### `/api/actions/runs/[runId]`

Proxyt zu Node Gateway `/actions/runs/:id`.

Alle Routes nutzen `requireAdminSession` für Auth.


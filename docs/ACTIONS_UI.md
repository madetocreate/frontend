# Action UI System - Dokumentation

## Übersicht

Das Action UI System generiert Action-Buttons vollständig aus der `ACTION_REGISTRY`. Alle UI-Komponenten nutzen die Registry als Single Source of Truth für Labels, Icons, Reihenfolge und Verfügbarkeit.

## Architektur

```
ACTION_REGISTRY (Source of Truth)
    │
    ├─ ActionDefinition
    │   ├─ id, label, description
    │   ├─ icon, uiPlacement, uiOrder
    │   ├─ requiresApproval
    │   └─ availability(context) → { available, reason }
    │
    ├─ getActionsForUI() → gefilterte, sortierte Actions
    │
    └─ ActionBar Komponente
        ├─ Primary Actions (Buttons)
        ├─ Secondary Actions (Buttons)
        └─ Menu Actions (Dropdown, zukünftig)
```

## Action Registry

**Datei:** `src/lib/actions/registry.ts`

Die `ACTION_REGISTRY` ist die Single Source of Truth für alle Actions. Jede Action muss folgende Felder haben:

```typescript
{
  id: 'inbox.summarize',
  label: 'Zusammenfassen',
  description?: 'Kurze Beschreibung',
  supportedModules: ['inbox'],
  outputType: 'summary',
  requiresApproval: false,
  uiPlacement: 'primary' | 'secondary' | 'menu' | 'hidden',
  uiOrder: 10, // Niedrigere Zahlen = früher in der Liste
  icon: 'SparklesIcon', // Name aus ACTION_ICON_MAP
  defaultConfig?: { tone: 'neutral' },
  availability?: (context) => { available: boolean; reason?: string },
  tags?: ['quick', 'summary'],
}
```

### UI-Metadaten

- **uiPlacement**: Wo die Action angezeigt wird
  - `primary`: Haupt-Buttons (direkt sichtbar)
  - `secondary`: Sekundäre Buttons (kleiner, weiter rechts)
  - `menu`: In "Mehr" Dropdown (zukünftig)
  - `hidden`: Nicht in UI angezeigt (Legacy-Aliases)

- **uiOrder**: Sortierreihenfolge (niedrigere Zahlen = früher)
  - Default: 1000
  - Empfohlen: 10, 20, 30, ... für Primary Actions

- **icon**: Icon-Name aus `ACTION_ICON_MAP` (siehe `src/lib/actions/icons.ts`)
  - Fallback: `SparklesIcon` wenn unbekannt

- **requiresApproval**: `true` für Actions, die Freigabe benötigen
  - UI zeigt dezentes Badge/Lock-Icon
  - Output enthält Approval-Card

## ActionBar Komponente

**Datei:** `src/components/actions/ActionBar.tsx`

Generische Komponente, die Action-Buttons aus der Registry generiert.

### Verwendung

```tsx
import { ActionBar } from '@/components/actions/ActionBar'

<ActionBar
  module="inbox"
  context={{
    module: 'inbox',
    target: {
      id: 'item-123',
      type: 'inbox',
      title: 'Kundenanfrage',
    },
    moduleContext: {
      inbox: {
        itemId: 'item-123',
        threadId: 'thread-123',
        channel: 'email',
      },
    },
  }}
  placement={['primary', 'secondary']} // Optional
  maxPrimary={4} // Optional, default: 4
  whitelist={['inbox.summarize']} // Optional
  blacklist={['inbox.top3']} // Optional
/>
```

### Props

- `module`: ActionModule (z.B. 'inbox', 'documents', 'crm')
- `context`: ActionContext (siehe Context-Contract)
- `placement`: Welche Placements anzeigen (default: ['primary', 'secondary'])
- `maxPrimary`: Max. Anzahl Primary Actions (default: 4)
- `whitelist`: Nur diese Actions anzeigen (optional)
- `blacklist`: Diese Actions ausschließen (optional)

### Verhalten

1. **Filterung**: Nur Actions für das Modul, mit passendem Placement
2. **Sortierung**: Nach `uiOrder` ASC, dann `label` ASC
3. **Availability**: Prüft `availability(context)` falls vorhanden
4. **Disabled**: Button disabled + Tooltip wenn Context ungültig oder availability=false
5. **Approval-Hinweis**: Zeigt Lock-Icon für `requiresApproval: true`

## Context-Contract

Jedes Modul hat spezifische Context-Anforderungen:

### Inbox

```typescript
{
  module: 'inbox',
  target: {
    id: 'item-123',
    type: 'inbox',
    title: 'Kundenanfrage',
  },
  moduleContext: {
    inbox: {
      itemId: 'item-123', // REQUIRED
      threadId: 'thread-123', // Optional, aber empfohlen
      channel: 'email', // Optional
    },
  },
}
```

### Documents

```typescript
{
  module: 'documents',
  moduleContext: {
    documents: {
      documentId: 'doc-123', // REQUIRED
    },
  },
}
```

### CRM

```typescript
{
  module: 'crm',
  moduleContext: {
    crm: {
      customerId: 'customer-123', // ODER itemId
    },
  },
}
```

## Selectors

**Datei:** `src/lib/actions/selectors.ts`

### getActionsForUI()

Holt gefilterte, sortierte Actions für UI:

```typescript
const actions = getActionsForUI({
  module: 'inbox',
  placement: ['primary', 'secondary'],
  whitelist: ['inbox.summarize'],
  context: myContext,
})
```

### getPrimaryActions() / getSecondaryActions()

Kurze Helper für nur Primary/Secondary:

```typescript
const primary = getPrimaryActions('inbox', context)
const secondary = getSecondaryActions('inbox', context)
```

## Validierung

**Datei:** `src/lib/actions/validate.ts`

Die Registry wird beim App-Start validiert (nur in Dev):

- Prüft: unique IDs, required fields, valid uiPlacement, icon existiert
- Bei Fehlern: throw (Dev) oder warn (Prod)
- Wird automatisch in `ActionRegistryValidator` aufgerufen

## Migration von hardcoded Actions

### WorkflowActionBar → ActionBar

**Alt (hardcoded):**

```tsx
<WorkflowActionBar 
  itemId="item-123"
  channel="email"
  title="Kundenanfrage"
/>
```

**Neu (Registry-driven):**

```tsx
<ActionBar
  module="inbox"
  context={{
    module: 'inbox',
    target: { id: 'item-123', type: 'email', title: 'Kundenanfrage' },
    moduleContext: {
      inbox: { itemId: 'item-123', threadId: 'item-123', channel: 'email' },
    },
  }}
/>
```

### ChatFirstFAB

**Alt (hardcoded CONTEXT_ACTIONS):**

```tsx
const CONTEXT_ACTIONS = {
  inbox: [
    { id: 'reply', label: 'Antwort schreiben', actionId: 'inbox.draftReply' },
    // ...
  ],
}
```

**Neu (Registry-driven):**

```tsx
const registryActions = getPrimaryActions(module, actionContext).slice(0, 4)
// Actions werden dynamisch aus Registry geholt
```

## Best Practices

1. **Keine hardcoded Action-Listen**: Immer `ActionBar` oder `getActionsForUI()` nutzen
2. **Context immer vollständig**: Validiere Context mit `validateContext()` vor Verwendung
3. **Icon-Namen konsistent**: Nutze nur Icons aus `ACTION_ICON_MAP`
4. **uiOrder stabil**: Ändere nicht willkürlich, nutze 10er-Schritte
5. **Availability prüfen**: Für dynamische Verfügbarkeit `availability()` nutzen

## Troubleshooting

### "Keine Actions gefunden"

- Prüfe: `module` korrekt?
- Prüfe: `placement` enthält gewünschte Placements?
- Prüfe: `whitelist`/`blacklist` schließt Actions aus?

### "Context ungültig"

- Prüfe: `moduleContext[module]` vorhanden?
- Prüfe: Required Fields (z.B. `itemId` für inbox) vorhanden?
- Nutze `validateContext(module, context)` zur Diagnose

### "Icon nicht gefunden"

- Prüfe: Icon-Name existiert in `ACTION_ICON_MAP`?
- Fallback: Default-Icon wird verwendet (kein Crash)


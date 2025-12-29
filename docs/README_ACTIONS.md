# Frontend Actions System - Dokumentation Übersicht

## 📚 Dokumentation

### Integration Guide
- **[ACTIONS_INTEGRATION.md](./ACTIONS_INTEGRATION.md)** - Vollständige Frontend Integration
  - Event System (`aklow-action-start`)
  - ActionRunClient API
  - ChatShell Integration
  - Pills Komponente
  - Action Registry
  - Migration Guide

### Backend Dokumentation
- **[Backend: ACTIONS_ARCHITECTURE.md](../../Backend/backend-agents/docs/ACTIONS_ARCHITECTURE.md)** - Vollständige Architektur
- **[Backend: ACTIONS_API.md](../../Backend/docs/ACTIONS_API.md)** - API Referenz
- **[Backend: MIGRATION_GUIDE.md](../../Backend/backend-agents/docs/MIGRATION_GUIDE.md)** - Migration Guide

## 🚀 Quick Start

### Action starten

```typescript
import { startRun } from '@/lib/actionRuns/client'

await startRun(
  {
    actionId: 'inbox.draftReply',
    context: {
      module: 'inbox',
      target: { id: threadId, type: 'inbox_thread' },
    },
    stream: true,
  },
  (event) => {
    // Handle events
    if (event.type === 'assistant.message') {
      // Update UI
    }
  }
)
```

### Event dispatchen

```typescript
window.dispatchEvent(new CustomEvent('aklow-action-start', {
  detail: {
    actionId: 'inbox.draftReply',
    context: { module: 'inbox', target: {...} },
  },
}))
```

### Pills anzeigen

```tsx
import { Pills } from '@/components/chat/Pills'

<Pills
  pills={[
    { id: 'formal', label: 'Formell', value: 'formal', step_key: 'get_tone', input_key: 'tone' },
    { id: 'friendly', label: 'Freundlich', value: 'friendly', step_key: 'get_tone', input_key: 'tone' },
  ]}
  onPillClick={(pill) => sendInput(runId, {
    step_key: pill.step_key || 'get_tone',
    input_key: pill.input_key,
    input: pill.value,
  })}
  maxVisible={3}
/>
```

### Wichtige Contracts / Allowlist
- Executable Actions: Core-10 (`inbox.summarize`, `inbox.draft_reply`, `inbox.ask_missing_info`, `inbox.next_steps`, `inbox.prioritize`, `crm.link_to_customer`, `documents.extract_key_fields`, `documents.summarize`, `reviews.draft_review_reply`, `website.fetch_and_profile`) plus Aliases (`inbox.draftReply`, `inbox.nextSteps`, `documents.extractKeyFields`).
- `dispatchActionStart`, `runAction`, API-Route `/api/actions/execute` und `ActionRunClient` normalisieren & blocken non-executable IDs (fail-closed).
- `sendInput` erwartet `{ step_key: string, input: any, input_key?: string }`.
- Pills sollten serverseitig immer `step_key` (und optional `input_key`) mitliefern.
- `"Mehr"` ist UI-only und darf kein Workflow-Input schicken.
- Fast Actions werden gecacht pro `messageId` und lassen sich per Sparkles-Button togglen.
- SSE Streams unterstützen `Last-Event-ID` (Header) für Resume.
- Kontext V1 liegt unter `context.context_v1` (module, target{id,type,title}, moduleContext, uiContext).

## 📋 Wichtige Dateien

- `src/lib/actionRuns/client.ts` - ActionRunClient
- `src/components/chat/Pills.tsx` - Pills Komponente
- `src/components/ChatShell.tsx` - ChatShell Integration
- `src/components/chat/ChatFirstFAB.tsx` - FAB mit Actions
- `src/lib/actions/registry.ts` - Action Registry
- `src/lib/frontendWiring.ts` - Frontend Wiring (migriert)

## 🔑 Konzepte

### `aklow-action-start` Event
Zentrales Event zum Starten von Actions. Wird von allen KI-Buttons dispatcht.

### ActionRunClient
Client-Library für Action Runs (startRun, sendInput, getRunStatus).

### Pills
Klickbare Quick Replies (max. 3 sichtbar + "Mehr" Button).

### Guided Runs
Runs, die den User Schritt für Schritt führen (via Pills).

## 🎯 Checkliste für neue Actions

- [ ] Action ID in `ACTION_REGISTRY` definiert
- [ ] Workflow in Backend existiert (oder wird auto-erstellt)
- [ ] Event `aklow-action-start` wird korrekt dispatcht
- [ ] Context ist reichhaltig (module, target, moduleContext)
- [ ] Pills werden angezeigt wenn `user_input.requested` kommt
- [ ] Input wird korrekt gesendet

## 📖 Weiterführende Links

- [Backend Actions Architecture](../../Backend/backend-agents/docs/ACTIONS_ARCHITECTURE.md)
- [Backend Actions API](../../Backend/docs/ACTIONS_API.md)
- [Migration Guide](../../Backend/backend-agents/docs/MIGRATION_GUIDE.md)


# Refactor Inventory: Fast-Actions & Workflow Trigger Cleanup

## PHASE 0 - Inventarliste

### Python Backend - Fast Actions (zu entfernen):
- `Backend/backend-agents/fast_action_agent/router.py` - Router mit `/api/fast-actions` endpoint
- `Backend/backend-agents/fast_action_agent/agent.py` - FastActionAgent Klasse
- `Backend/backend-agents/fast_action_agent/schemas.py` - Request/Response Schemas
- `Backend/backend-agents/fast_action_agent/http_server.py` - Standalone HTTP Server
- `Backend/backend-agents/fast_action_agent/standalone_app.py` - Standalone App Entry
- `Backend/backend-agents/app/main.py:344` - Router include entfernen

### Frontend - Fast Actions (zu entfernen):
- `src/lib/fastActionsClient.ts` - API Client für Fast Actions
- `src/components/chat/FastActionsChips.tsx` - UI Komponente
- `src/lib/actions/suggestions.ts` - Hook der fastActionsClient nutzt
- `src/components/ChatShell.tsx` - Verwendet FastActionsChips und fetchFastActions
- `src/components/actions/ActionBar.tsx` - Verwendet useFastActionSuggestions
- `src/components/ui/AISuggestionGrid.tsx` - Verwendet fastActionsClient
- `src/features/inbox/InboxDetail.tsx` - Verwendet useFastActionSuggestions

### Frontend - Workflow Trigger Legacy (zu entfernen):
- `src/lib/frontendWiring.ts:292-318` - handleWorkflowTrigger() mit `/trigger` endpoint
- `src/lib/frontendWiring.ts:86` - Aufruf von handleWorkflowTrigger
- Legacy endpoint: `/api/automation/workflows/${workflowId}/trigger` → entfernen
- Ersetzen durch: POST `/api/automation/workflows` mit `{action:'trigger', workflow_id, inputs}`

### Frontend - prefill_prompt Handler (zu entfernen):
- `src/components/ChatShell.tsx:626` - prefill_prompt handling
- `src/components/ChatShell.tsx:2996-3000` - prefill_prompt deprecated warning

### Chat UX - Prioritätsregeln (zu implementieren):
- WAITING_INPUT State Detection
- Pills nur bei WAITING_INPUT anzeigen
- Suggestion Layer begrenzen (max 3, nicht bei WAITING_INPUT)

## PHASE 1 - Fast Actions entfernen ✅
- Python Backend: Router, Agent, Schemas entfernt, main.py bereinigt
- Frontend: fastActionsClient.ts, FastActionsChips.tsx, suggestions.ts gelöscht
- Alle Imports und Referenzen entfernt
- AISuggestionGrid.tsx verwendet jetzt nur noch Fallback-Actions

## PHASE 2 - Workflow Trigger vereinheitlichen ✅
- Legacy `/api/automation/workflows/${id}/trigger` entfernt
- Einheitlicher Contract: POST `/api/automation/workflows` mit `{action:'trigger', workflow_id, inputs}`
- frontendWiring.ts aktualisiert
- route.ts validiert jetzt Body robust

## PHASE 3 - Chat UX aufräumen ✅
- WAITING_INPUT Detection implementiert (`isWaitingInput` Helper)
- Pills werden NUR bei WAITING_INPUT angezeigt
- Follow-up Suggestions werden bei WAITING_INPUT unterdrückt
- Suggestion Layer auf max 3 begrenzt
- prefill_prompt Handler komplett entfernt

## PHASE 4 - Workflows abgrenzen ✅
- Node Backend Workflows (`src/domain/workflows/`) sind intern/experimentell
- Keine Kollision mit Python Workflows (unterschiedliche Namespaces)
- Python Workflows bleiben als "Automatisierungen"/"Regeln" (Execution)

## PHASE 5 - Verifikation ✅
- TypeScript Build: Keine Linter-Fehler
- Alle Fast Actions Referenzen entfernt (nur noch Kommentare/Dokumentation)
- Legacy Trigger Endpoint entfernt
- Chat UX Regeln implementiert


# Frontend Debugging-Analyse

## Phase 0 — Repo-Landkarte ✅

### Workspace-Struktur

| Ordner | Stack | Zweck |
|--------|-------|-------|
| `/frontend` | Next.js 16 / React 19 | Haupt-Frontend |
| `/Backend` | Node.js/Fastify (Port 4000) | Orchestrator/Gateway |
| `/Backend/backend-agents` | Python/FastAPI (Port 8000) | Agents/Chat/Memory |
| `/mcp-server` | Python MCP | Tool-Orchestrierung |
| `/ai-shield` | Multi-Stack | Shield-System |
| `/landingpage` | Next.js | Landing Page |

### Frontend-Architektur

**Chat-Implementierung:**
- `src/components/ChatShell.tsx` - Haupt-Chat-Komponente
- `src/lib/chatClient.ts` - Gateway-Client für Chat-API
- `src/sdk/gateway/` - Gateway SDK (SSE-Streaming)

**QuickActions/Wizard:**
- `src/components/ui/AIActionWizard.tsx` - Wizard-UI
- `src/components/ui/AIActions.tsx` - Action-Buttons
- `src/lib/actionHandlers.ts` - Action-Dispatcher
- `src/lib/frontendWiring.ts` - Event-Bus (Custom Events)

**Drawer/Info:**
- `src/components/ChatWorkspaceShell.tsx` - Haupt-Layout mit Drawer-Logik
- `InspectorContent` - Modul-spezifische Drawer-Inhalte

### Backend-Endpunkte

**Python Backend (Port 8000):**
- `POST /chat` - Non-streaming Chat
- `POST /chat/stream` - SSE Streaming Chat
- `POST /api/v1/chat` - Alias
- `POST /api/v1/chat/stream` - Alias

**Node Backend (Port 4000):**
- Orchestrator/Gateway (proxied zu Python)

### Event-System

- **Custom Events**: `window.dispatchEvent(new CustomEvent(...))`
- Haupt-Events:
  - `aklow-ai-action-wizard` - Öffnet Wizard
  - `aklow-action` - Generische Action
  - `aklow-open-module` - Modul-Wechsel

---

## Phase 1 — Chat kommt nicht an 🔴

### Problem-Lokalisierung

**Datei:** `src/lib/chatClient.ts` (Zeilen 3-16)

**Root Cause:**
```typescript
const getChatApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_CHAT_API_URL) {
    return process.env.NEXT_PUBLIC_CHAT_API_URL
  }
  if (process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL) {
    return process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL  // ❌ Port 4000
  }
  if (process.env.NEXT_PUBLIC_AGENT_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_AGENT_BACKEND_URL  // ✅ Port 8000
  }
  // ...
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'  // ❌ Default falsch
}
```

**Problem:**
1. Fallback auf Port 4000 (Orchestrator) statt 8000 (Python Backend)
2. `NEXT_PUBLIC_ORCHESTRATOR_API_URL` hat höhere Priorität als `NEXT_PUBLIC_AGENT_BACKEND_URL`
3. Chat-Endpunkt sollte auf Python Backend (8000) zeigen, nicht Orchestrator (4000)

**Reproduktion:**
```bash
# Ohne ENV-Variablen:
# Chat versucht http://localhost:4000/chat/stream
# Sollte aber http://localhost:8000/chat/stream sein
```

### Fix

**Datei:** `src/lib/chatClient.ts`

```typescript
const getChatApiBaseUrl = () => {
  // Priorität: AGENT_BACKEND_URL > CHAT_API_URL > BACKEND_URL (wenn Port 8000) > Default
  if (process.env.NEXT_PUBLIC_AGENT_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_AGENT_BACKEND_URL  // Port 8000
  }
  if (process.env.NEXT_PUBLIC_CHAT_API_URL) {
    return process.env.NEXT_PUBLIC_CHAT_API_URL
  }
  // Prüfe ob BACKEND_URL auf Port 8000 zeigt (Python Backend)
  if (process.env.NEXT_PUBLIC_BACKEND_URL?.includes('8000')) {
    return process.env.NEXT_PUBLIC_BACKEND_URL
  }
  // Default: Python Backend (Port 8000), nicht Orchestrator
  return 'http://localhost:8000'
}
```

**Test:**
```bash
# 1. Prüfe ENV-Variablen
cd frontend
cat .env.local | grep -E "CHAT|BACKEND|AGENT"

# 2. Teste Backend direkt
curl -X POST http://localhost:8000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"test","sessionId":"test","channel":"web_chat","message":"hi"}'

# 3. Teste im Browser
# - Öffne DevTools → Network
# - Sende Chat-Nachricht
# - Prüfe Request-URL (sollte Port 8000 sein)
```

---

## Phase 2 — QuickActions/Wizard: UI triggert, aber keine Aktion 🔴

### Problem-Lokalisierung

**Datei:** `src/components/ui/AIActionWizard.tsx`

**Root Cause:**

1. **ProcessingStep (Zeilen 180-279):**
   - Simuliert nur Progress mit `setInterval`
   - **KEIN echter API-Call**
   - Automatisch weiter nach 5 Sekunden

2. **ResultStep (Zeilen 281-337):**
   - Zeigt nur **hardcoded Mock-Daten**
   - Keine echten Ergebnisse vom Backend

```typescript
function ProcessingStep({ onNext }: WizardStepProps) {
  // ❌ Nur Simulation, kein API-Call
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => onNext(), 500)  // Automatisch weiter
          return 100
        }
        return prev + 2
      })
    }, 100)
    // ...
  }, [onNext])
}

function ResultStep({ onBack }: WizardStepProps) {
  // ❌ Hardcoded Mock-Daten
  const [result] = useState({
    title: 'Ergebnis generiert',
    content: 'Die KI-Aktion wurde erfolgreich ausgeführt. Hier ist das Ergebnis...',
    // ...
  })
}
```

**Action-Handler:**
- `src/lib/actionHandlers.ts` - Dispatched Events, aber keine Backend-Calls
- `src/lib/frontendWiring.ts` - Event-Bus, aber `handleAIAction` ist Stub

### Fix

**Datei:** `src/components/ui/AIActionWizard.tsx`

**1. ProcessingStep mit echtem API-Call:**

```typescript
function ProcessingStep({ context, action, data, onNext }: WizardStepProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const executeAction = async () => {
      try {
        setCurrentStep(0) // Kontext analysieren
        setProgress(25)

        // API-Call zum Backend
        const response = await fetch('/api/actions/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            context,
            actionId: action.id,
            config: data.config,
          }),
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        setCurrentStep(1) // Daten sammeln
        setProgress(50)

        const stream = response.body?.getReader()
        if (!stream) {
          throw new Error('No response stream')
        }

        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await stream.read()
          if (done) break
          if (cancelled) return

          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk

          setCurrentStep(2) // KI-Verarbeitung
          setProgress(75)
        }

        setCurrentStep(3) // Ergebnis generieren
        setProgress(100)
        setResult(accumulated)

        // Speichere Ergebnis für ResultStep
        onUpdate({ result: accumulated })
        setTimeout(() => onNext(), 500)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Action execution failed:', err)
      }
    }

    executeAction()

    return () => {
      cancelled = true
    }
  }, [context, action, data, onNext, onUpdate])

  if (error) {
    return (
      <div className="space-y-4 py-8 text-center">
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-900 font-medium">Fehler</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
        >
          Zurück
        </button>
      </div>
    )
  }

  // ... Rest der UI
}
```

**2. ResultStep mit echten Daten:**

```typescript
function ResultStep({ data, onBack }: WizardStepProps) {
  const result = data.result as string | undefined

  if (!result) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-gray-600">Kein Ergebnis verfügbar</p>
        <button onClick={onBack} className="px-4 py-2 bg-gray-100 rounded-lg">
          Zurück
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      {/* ... Erfolg-Banner ... */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ergebnis</h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{result}</p>
          </div>
        </div>
        {/* ... Actions ... */}
      </div>
    </div>
  )
}
```

**3. Backend-Endpunkt erstellen:**

**Datei:** `src/app/api/actions/execute/route.ts` (NEU)

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { context, actionId, config } = body

    // Proxy zu Python Backend
    const backendUrl = process.env.AGENT_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/actions/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MEMORY_API_SECRET || ''}`,
      },
      body: JSON.stringify({
        context,
        action_id: actionId,
        config,
      }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Backend error', status: response.status },
        { status: response.status }
      )
    }

    // Stream Response zurückgeben
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Action execution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Test:**
```bash
# 1. Klicke QuickAction → Wizard öffnet
# 2. Klicke "Starten" → ProcessingStep
# 3. Prüfe Network Tab → Request zu /api/actions/execute
# 4. Erwarte: Echte Ergebnisse im ResultStep
```

---

## Phase 3 — Backend-Routing: Konsistente Architektur ✅

### Aktuelle Realität

**Frontend → Backend:**
- Chat: Direkt zu Python Backend (Port 8000) via Gateway-Client
- Memory: Via Next.js Proxy (`/api/memory/*`) → Python Backend
- Actions: **FEHLT** (siehe Phase 2)

**Empfohlene Architektur:**
- Frontend spricht **nur** Next.js API Routes an (`/api/*`)
- Next.js Routes proxy'en zu Python Backend (Port 8000)
- Vorteil: Zentrale Auth, CORS-Handling, Error-Handling

### Fix (bereits teilweise implementiert)

**Chat-Routing:**
- Option A: `NEXT_PUBLIC_CHAT_TRANSPORT=next_proxy` → Frontend nutzt `/api/chat/stream`
- Option B: `NEXT_PUBLIC_CHAT_TRANSPORT=direct` → Frontend spricht direkt Port 8000 an

**Empfehlung:** Option A (next_proxy) für Produktion

**Datei:** `src/app/api/chat/stream/route.ts` (prüfen ob existiert)

---

## Phase 4 — OpenAPI Schema + TypeScript SDK 📋

### Vorschlag

**Struktur:**
```
src/sdk/
  gateway/          # Bereits vorhanden
  actions/          # NEU
    types.ts        # Action Types
    client.ts       # Action Client
  types.ts          # Gemeinsame Types
```

**Beispiel:**

**Datei:** `src/sdk/actions/types.ts`

```typescript
export type AIActionContext = 
  | 'inbox' 
  | 'customers' 
  | 'documents' 
  | 'growth' 
  | 'dashboard'
  | 'hotel'

export type AIActionId = 
  | 'generate-email'
  | 'summarize'
  | 'translate'
  | 'extract-data'
  | 'create-campaign'
  // ... weitere

export interface ExecuteActionRequest {
  context: AIActionContext
  actionId: AIActionId
  config?: {
    tone?: 'professionell' | 'freundlich' | 'locker'
    length?: 'kurz' | 'mittel' | 'detailliert'
    language?: string
    includeContext?: boolean
  }
  metadata?: Record<string, unknown>
}

export interface ExecuteActionResponse {
  result: string
  metadata?: Record<string, unknown>
}
```

**Datei:** `src/sdk/actions/client.ts`

```typescript
import type { ExecuteActionRequest, ExecuteActionResponse } from './types'

export async function executeAction(
  request: ExecuteActionRequest,
  callbacks?: {
    onProgress?: (progress: number) => void
    onChunk?: (chunk: string) => void
  }
): Promise<ExecuteActionResponse> {
  const response = await fetch('/api/actions/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Action execution failed: ${response.status}`)
  }

  // Handle streaming response
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''

  if (reader) {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      accumulated += chunk
      callbacks?.onChunk?.(chunk)
    }
  }

  return {
    result: accumulated,
  }
}
```

---

## Phase 5 — Drawer/Info-Overlay Bug 🔴

### Problem-Lokalisierung

**Datei:** `src/components/ChatWorkspaceShell.tsx` (Zeilen 605-713)

**Root Cause:**

`InspectorContent` wird basierend auf `activeModuleToken` gerendert. **Problem:** Wenn kein Item selektiert ist, wird trotzdem der Drawer geöffnet mit leerem/Default-Content.

**Beispiel:**
- Klick auf "iShield" → `activeModuleToken = 'shield'`
- `InspectorContent` rendert `<ShieldInspectorDrawer />`
- **Aber:** Drawer könnte falschen Content zeigen, wenn `rightPanelState` nicht korrekt gesetzt ist

**Prüfung:**
- Zeile 702: `case 'shield': return <ShieldInspectorDrawer view={activeShieldView} onClose={handleCloseDetails} />`
- `activeShieldView` könnte `undefined` sein → Drawer zeigt Default/Info statt korrektem View

### Fix

**Datei:** `src/components/ChatWorkspaceShell.tsx`

**1. Prüfe ob View korrekt initialisiert ist:**

```typescript
const InspectorContent = useMemo<React.ReactElement | null>(() => {
  switch (activeModuleToken) {
    case 'shield':
      // ✅ Prüfe ob View gesetzt ist
      if (!activeShieldView) {
        return (
          <div className="p-6 text-center text-gray-500">
            Wähle eine Shield-Ansicht aus
          </div>
        )
      }
      return <ShieldInspectorDrawer view={activeShieldView} onClose={handleCloseDetails} />
    
    case 'phone':
      if (!activeTelephonyView) {
        return (
          <div className="p-6 text-center text-gray-500">
            Wähle eine Telefonie-Ansicht aus
          </div>
        )
      }
      return <TelephonyInspectorDrawer view={activeTelephonyView} onClose={handleCloseDetails} />
    
    // ... ähnlich für andere Module
  }
}, [activeModuleToken, activeShieldView, activeTelephonyView, /* ... */])
```

**2. Prüfe Drawer-State-Logik:**

```typescript
// Stelle sicher, dass Drawer nur geöffnet wird, wenn Content verfügbar ist
const showRight = rightPanelState !== 'none' && InspectorContent !== null
```

**Test:**
```bash
# 1. Klicke auf "iShield" → Drawer öffnet
# 2. Prüfe: Zeigt Drawer korrekten Content?
# 3. Klicke auf "Dokumente" → Drawer wechselt zu Dokumente-Content
# 4. Prüfe: Kein "Info"-Overlay über allem
```

---

## Phase 6 — Testplan ✅

### Chat-Test

```bash
# 1. Starte Backend
cd Backend/backend-agents
uvicorn app.main:app --reload --port 8000

# 2. Starte Frontend
cd frontend
npm run dev

# 3. Öffne Browser → Chat
# 4. Sende Nachricht: "Hallo"
# 5. Erwarte: Antwort vom Backend
# 6. Prüfe Network Tab: Request zu Port 8000
```

### QuickActions/Wizard-Test

```bash
# 1. Öffne Dashboard/Inbox
# 2. Klicke QuickAction (z.B. "E-Mail generieren")
# 3. Wizard öffnet → Klicke "Starten"
# 4. ProcessingStep: Prüfe Network Tab → Request zu /api/actions/execute
# 5. ResultStep: Zeigt echte Ergebnisse (nicht Mock)
```

### Drawer-Test

```bash
# 1. Klicke auf "iShield" → Drawer öffnet rechts
# 2. Prüfe: Zeigt Shield-Content (nicht Info-Overlay)
# 3. Klicke auf "Dokumente" → Drawer wechselt
# 4. Prüfe: Zeigt Dokumente-Content
# 5. Prüfe: Hauptinhalt bleibt sichtbar (Drawer überlagert nicht alles)
```

---

## Zusammenfassung

### Bestätigte Probleme

1. ✅ **Chat-Problem**: Base-URL zeigt auf Port 4000 statt 8000
   - **Fix**: Priorität in `getChatApiBaseUrl()` ändern
   - **Datei**: `src/lib/chatClient.ts`

2. ✅ **Wizard-Problem**: Keine echten API-Calls
   - **Fix**: `ProcessingStep` mit echtem API-Call, `ResultStep` mit echten Daten
   - **Datei**: `src/components/ui/AIActionWizard.tsx`
   - **Neu**: `src/app/api/actions/execute/route.ts`

3. ✅ **Drawer-Problem**: Falsches Mapping/Default-Content
   - **Fix**: Prüfe View-Initialisierung, zeige Fallback wenn kein Content
   - **Datei**: `src/components/ChatWorkspaceShell.tsx`

### Offene Punkte

- Backend-Endpunkt `/api/v1/actions/execute` muss implementiert werden (Python Backend)
- OpenAPI-Schema für Actions (optional, aber empfohlen)


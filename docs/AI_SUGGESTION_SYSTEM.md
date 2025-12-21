# AI Suggestion System - Vollständige Dokumentation

## Übersicht

Das **AI Suggestion System** ist ein intelligentes, kontextsensitives Vorschlagssystem, das KI-generierte Aktionen für alle Detail-Drawer im Frontend bereitstellt. Es nutzt den **FastActionAgent** (Backend) zur Generierung von kontextbezogenen, priorisierten Aktionen.

## 🎯 Ziele

- **Kontextsensitive Vorschläge**: KI-Vorschläge basieren auf dem aktuellen Kontext (Modul, Inhalt, Kanal)
- **Priorisierung**: Aktionen werden nach Nutzen und Relevanz sortiert
- **4 Hauptaktionen + 4 weitere**: Optimale Balance zwischen Übersicht und Funktionalität
- **Ausführbare Aktionen**: Alle Vorschläge sind direkt ausführbar über das Action-Handling-System
- **Fallback-Mechanismus**: Bei API-Fehlern werden sinnvolle Standard-Aktionen angezeigt

## 🏗️ Architektur

### Komponenten-Hierarchie

```
Detail Drawer (z.B. InboxDetailsDrawer)
└── AISuggestionGrid
    ├── FastActionAgent API Call (/api/fast-actions)
    ├── 4 Hauptaktionen (2x2 Grid)
    └── 4 weitere Aktionen (expandierbar)
```

### Datenfluss

```
1. Detail Drawer öffnet sich
   ↓
2. AISuggestionGrid erhält Kontext (context, text, summary, channel)
   ↓
3. fetchFastActions() sendet Request an Backend
   ↓
4. FastActionAgent analysiert Kontext und generiert 8 Vorschläge
   ↓
5. Vorschläge werden nach Priorität sortiert (Top 4 + 4 weitere)
   ↓
6. UI rendert 2x2 Grid mit Hauptaktionen
   ↓
7. Bei Klick: dispatchAction() + CustomEvent für Wizard
```

## 📦 Komponenten

### AISuggestionGrid

**Datei:** `frontend/src/components/ui/AISuggestionGrid.tsx`

**Props:**
```typescript
type AISuggestionGridProps = {
  context: AIActionContext        // Modul-Kontext (inbox, customer, document, etc.)
  text?: string                  // Primärer Inhalt (z.B. Nachrichtentext)
  summary?: string               // Kurze Zusammenfassung (z.B. Betreff, Titel)
  channel?: string               // Kanal (email, chat, phone)
  fallbackActions?: FastActionSuggestion[]  // Fallback-Aktionen
  className?: string             // Zusätzliche CSS-Klassen
}
```

**Features:**
- Automatisches Laden von Vorschlägen beim Mount
- 2x2 Grid für 4 Hauptaktionen
- Expandierbare "Mehr"-Sektion mit 4 weiteren Aktionen
- Fallback auf Standard-Aktionen bei API-Fehlern
- Loading-State während API-Call
- Error-Handling mit Fallback

**Verwendung:**
```tsx
<AISuggestionGrid
  context="inbox"
  text={messageText}
  summary={subject}
  channel="email"
/>
```

## 🔌 Backend-Integration

### FastActionAgent API

**Endpoint:** `POST /api/fast-actions`

**Request:**
```typescript
{
  surface: 'detail_drawer',
  language: 'de',
  max_actions: 8,
  channel?: string,
  last_user_message?: string,
  conversation_summary?: string,
  context: {
    module: 'inbox' | 'customer' | 'document' | 'growth' | ...,
    summary?: string,
    text?: string
  }
}
```

**Response:**
```typescript
{
  suggestions: [
    {
      id: string,
      label: string,
      handler: 'prefill_prompt' | 'open_ui' | ...,
      payload: Record<string, unknown>,
      risk: {
        side_effect_level: number,
        requires_confirmation: boolean
      },
      confidence: number,  // 0.0 - 1.0
      why_this: string    // Begründung für den Vorschlag
    }
  ],
  meta: {
    surface: string,
    max_actions: number,
    signals: string[],
    generated_at: string
  }
}
```

### FastActionsClient

**Datei:** `frontend/src/lib/fastActionsClient.ts`

**Funktion:** `fetchFastActions(payload: FastActionsRequest): Promise<FastActionsResponse>`

**URL-Konfiguration:**
```typescript
// Priorität:
1. NEXT_PUBLIC_FAST_ACTIONS_URL
2. NEXT_PUBLIC_CHAT_API_URL
3. NEXT_PUBLIC_AGENT_BACKEND_URL
4. NEXT_PUBLIC_BACKEND_URL (wenn Port 8000)
5. Default: http://127.0.0.1:8000
```

## 🎨 UI-Design

### Layout

- **Container**: Gradient-Hintergrund (blue-50/50 → indigo-50/50)
- **Header**: Icon + Titel "KI-Vorschläge" + Kontext-Anzeige
- **Grid**: 2x2 Layout für Hauptaktionen
- **Aktionen**: Weiße Cards mit Icon, Label, Beschreibung
- **"Mehr"-Button**: Expandiert 4 weitere Aktionen

### Styling

```css
/* Container */
bg-gradient-to-r from-blue-50/50 to-indigo-50/50
border border-blue-100/60
rounded-2xl
p-4

/* Action Cards */
bg-white/70
border border-[var(--ak-color-border-subtle)]
hover:border-[var(--ak-color-border-strong)]
hover:bg-white
shadow-sm
```

## ⚡ Action-Handling

### Dispatch-System

Bei Klick auf eine Aktion werden zwei Events ausgelöst:

1. **Global Action Dispatcher:**
```typescript
dispatchAction({
  type: 'ai-action',
  actionId: suggestion.id,
  context: context,
  data: {
    handler: suggestion.handler,
    payload: suggestion.payload,
    confidence: suggestion.confidence
  }
})
```

2. **Wizard Event:**
```typescript
window.dispatchEvent(
  new CustomEvent('aklow-ai-action-wizard', {
    detail: {
      context,
      suggestion,
      source: 'detail-drawer'
    }
  })
)
```

### Handler-Typen

- **`prefill_prompt`**: Füllt Chat-Input mit vorgefertigtem Text
- **`open_ui`**: Öffnet UI-Panel (z.B. Fast Actions Panel)
- **`api_call`**: Führt direkten API-Call aus
- **`navigation`**: Navigiert zu anderem Modul/View

## 📍 Integration in Detail-Drawer

### InboxDetailsDrawer

```tsx
<AISuggestionGrid
  context="inbox"
  text={thread?.lastMessage?.text}
  summary={thread?.subject}
  channel={thread?.channel}
/>
```

**Typische Vorschläge:**
- Antwort verfassen
- Zusammenfassen
- Priorität setzen
- Übersetzen
- Follow-up vorschlagen
- Tasks extrahieren

### CustomerDetailsDrawer

```tsx
<AISuggestionGrid
  context="customer"
  text={customer?.notes}
  summary={`${customer?.name} - ${customer?.company}`}
/>
```

**Typische Vorschläge:**
- Kunde anreichern
- Segment zuweisen
- Angebot vorschlagen
- Churn-Risiko prüfen
- Produkt empfehlen
- Tasks extrahieren

### DocumentDetailsDrawer

```tsx
<AISuggestionGrid
  context="document"
  text={document?.content}
  summary={document?.name}
/>
```

**Typische Vorschläge:**
- Zusammenfassen
- Kernpunkte extrahieren
- Übersetzen
- Verbesserungen vorschlagen
- Compliance prüfen
- Executive Summary

### GrowthDetailsDrawer

```tsx
<AISuggestionGrid
  context="growth"
  text={campaign?.description}
  summary={campaign?.name}
/>
```

**Typische Vorschläge:**
- Kampagne starten
- Zielgruppe vorschlagen
- Budget optimieren
- Content generieren
- Performance analysieren
- Kanäle vorschlagen

### ShieldInspectorDrawer

```tsx
<AISuggestionGrid
  context="shield"
  summary="AI Shield Status"
/>
```

**Typische Vorschläge:**
- Policy Check
- PII prüfen
- Risiko-Report
- Injection Scan

### TelephonyInspectorDrawer

```tsx
<AISuggestionGrid
  context="telephony"
  text={call?.transcript}
  summary={`Anruf: ${call?.from}`}
/>
```

**Typische Vorschläge:**
- Call zusammenfassen
- Action Items extrahieren
- Stimmung analysieren
- Follow-up vorschlagen
- Report erstellen

### WebsiteInspectorDrawer

```tsx
<AISuggestionGrid
  context="website"
  summary="Website Bot Status"
/>
```

**Typische Vorschläge:**
- Antworten trainieren
- Widget optimieren
- Snippets generieren
- Traffic analysieren
- Leadflow optimieren

## 🔄 Fallback-Mechanismus

### Standard-Aktionen

Falls der FastActionAgent nicht erreichbar ist oder ein Fehler auftritt, werden kontextspezifische Standard-Aktionen angezeigt:

**Datei:** `frontend/src/components/ui/AISuggestionGrid.tsx`

```typescript
const DEFAULT_FALLBACKS: Partial<Record<AIActionContext, FastActionSuggestion[]>> = {
  inbox: [/* 6 Standard-Aktionen */],
  customer: [/* 6 Standard-Aktionen */],
  document: [/* 6 Standard-Aktionen */],
  // ...
}
```

### Error-Handling

```typescript
try {
  const res = await fetchFastActions(/* ... */)
  setSuggestions(res.suggestions)
} catch (e) {
  console.warn('[AI Suggestions] fallback to defaults', e)
  const fb = fallbackActions ?? DEFAULT_FALLBACKS[context] ?? []
  setSuggestions(fb)
  setError(e?.message || 'Konnte Vorschläge nicht laden')
}
```

## 🧪 Testing

### Unit Tests

```typescript
// Test AISuggestionGrid Rendering
describe('AISuggestionGrid', () => {
  it('renders 4 primary actions in 2x2 grid', () => {
    // ...
  })
  
  it('shows "Mehr" button when more than 4 actions available', () => {
    // ...
  })
  
  it('falls back to default actions on API error', () => {
    // ...
  })
})
```

### Integration Tests

```typescript
// Test API Integration
describe('FastActionsClient', () => {
  it('fetches suggestions from /api/fast-actions', async () => {
    // ...
  })
  
  it('handles API errors gracefully', async () => {
    // ...
  })
})
```

## 🔧 Konfiguration

### Environment Variables

```env
# Fast Actions API URL (optional, hat höchste Priorität)
NEXT_PUBLIC_FAST_ACTIONS_URL=http://localhost:8000

# Fallback URLs (in Prioritätsreihenfolge)
NEXT_PUBLIC_CHAT_API_URL=http://localhost:8000
NEXT_PUBLIC_AGENT_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend-Konfiguration

**FastActionAgent** muss auf Port 8000 laufen und den Endpoint `/api/fast-actions` bereitstellen.

**Datei:** `Backend/backend-agents/fast_action_agent/router.py`

```python
@router.post("", response_model=FastActionsResponse)
def post_fast_actions(req: FastActionsRequest) -> FastActionsResponse:
    out = suggest_fast_actions(req.to_agent_dict())
    return FastActionsResponse(**out)
```

## 📊 Performance

### Optimierungen

- **Lazy Loading**: Vorschläge werden nur geladen, wenn der Drawer geöffnet ist
- **Caching**: Vorschläge werden im Component-State gecacht
- **Debouncing**: API-Calls werden nicht bei jedem Render ausgelöst
- **Fallback**: Schnelle Fallback-Aktionen bei API-Fehlern

### Metriken

- **API-Response-Zeit**: < 500ms (Ziel)
- **UI-Render-Zeit**: < 100ms
- **Fallback-Zeit**: < 50ms

## 🚀 Best Practices

### Kontext-Übergabe

1. **Immer relevanten Kontext übergeben:**
   - `text`: Primärer Inhalt (Nachricht, Dokument, etc.)
   - `summary`: Kurze Zusammenfassung (Betreff, Titel, etc.)
   - `channel`: Kanal (email, chat, phone)

2. **Nicht überladen:**
   - Nur relevante Informationen übergeben
   - Keine unnötigen Metadaten

### Fehlerbehandlung

1. **Graceful Degradation:**
   - Immer Fallback-Aktionen bereitstellen
   - User sollte nie leeren State sehen

2. **Error-Logging:**
   - Fehler in Console loggen
   - Keine störenden Error-Toasts

### UI/UX

1. **Klarheit:**
   - Labels sollten selbsterklärend sein
   - Beschreibungen helfen bei der Entscheidung

2. **Responsivität:**
   - Grid passt sich an Container-Breite an
   - Mobile-optimiert

## 🔮 Zukünftige Erweiterungen

### Geplante Features

- [ ] **Persönliche Präferenzen**: Lernen aus User-Interaktionen
- [ ] **A/B Testing**: Testen verschiedener Vorschlags-Algorithmen
- [ ] **Batch-Aktionen**: Mehrere Aktionen gleichzeitig ausführen
- [ ] **Custom Actions**: User-definierte Aktionen
- [ ] **Action-History**: Verlauf der ausgewählten Aktionen

### Optimierungen

- [ ] **Caching**: Vorschläge für ähnliche Kontexte cachen
- [ ] **Preloading**: Vorschläge vorausladen beim Hover
- [ ] **Analytics**: Tracking von Click-Through-Rates

## 📚 Weitere Ressourcen

- [FastActionAgent Backend Documentation](../../Backend/backend-agents/fast_action_agent/README.md)
- [Action Handlers Documentation](../lib/actionHandlers.ts)
- [Frontend Architecture](./ARCHITECTURE.md)


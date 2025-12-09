import type {
  ChatKitOptions,
  StartScreenPrompt,
  ComposerOption,
  HistoryOption,
  ThreadItemActionsOption,
  EntitiesOption,
} from "@openai/chatkit-react"

export const CHATKIT_API_URL =
  process.env.NEXT_PUBLIC_CHATKIT_API_URL ?? "http://127.0.0.1:8000/chatkit"

export const CHATKIT_DOMAIN_KEY =
  process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY ?? "domain_pk_localhost_dev"

export const GREETING =
  "Hi, ich bin dein KI Assistent. Womit kann ich dir helfen?"

// Start-Screen-Prompts (vorerst leer, wir bauen später eigene Widgets)
export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "Marketing-Kampagne starten",
    prompt: "Hilf mir, eine Marketing-Kampagne zu planen.",
    icon: "sparkle",
  },
  {
    label: "Automation aufsetzen",
    prompt: "Hilf mir, einen Automatisierungs-Workflow einzurichten.",
    icon: "bolt",
  },
  {
    label: "Kundendaten zusammenfassen",
    prompt: "Fasse meine letzten Kundengespräche und Notizen zusammen.",
    icon: "profile-card",
  },
  {
    label: "Was kannst du für mich tun?",
    prompt: "Erklär mir kurz, wobei du mir als Assistent helfen kannst.",
    icon: "circle-question",
  },
]

export const COMPOSER_ATTACHMENTS: NonNullable<
  ComposerOption["attachments"]
> = {
  enabled: false, // Disabled - using tools menu instead
  maxSize: 50 * 1024 * 1024,
  maxCount: 5,
}

// Composer-Tools: Custom menu items für den Plus-Button
export const COMPOSER_TOOLS: ComposerOption["tools"] = [
  {
    id: 'file-photo',
    label: 'Datei oder Foto',
    icon: 'images',
  },
  {
    id: 'internet-search',
    label: 'Internet-Suche',
    icon: 'search',
  },
  {
    id: 'create-image',
    label: 'Bild erstellen',
    icon: 'square-image',
  },
  {
    id: 'learning-mode',
    label: 'Lernmodus',
    icon: 'book-open',
  },
]

export const HISTORY_OPTIONS: HistoryOption = {
  enabled: true,
  showDelete: true,
  showRename: true,
}

export const THREAD_ITEM_ACTIONS: ThreadItemActionsOption = {
  feedback: true,
  retry: true,
}

// Entities/Pills aktivieren
export const ENTITIES_OPTIONS: EntitiesOption = {
  onClick: (entity) => {
    console.log("Entity clicked:", entity)
  },
  onRequestPreview: async (entity) => {
    console.log("Preview requested for entity:", entity)
    // Hier könnte ein API-Call kommen, der Details lädt
    return { preview: null }
  },
  onTagSearch: async (query) => {
    console.log("Entity tag search:", query)
    // Hier könnte ein API-Call für Tag-Suche kommen
    return []
  },
}

// Zentrales ChatKit-Options-Objekt für den Workspace-Chat
export const chatKitOptions: ChatKitOptions = {
  // 1) Verbindung zu deinem self-hosted Backend
  api: {
    url: CHATKIT_API_URL,
    domainKey: CHATKIT_DOMAIN_KEY,
    uploadStrategy: {
      type: "two_phase",
    },
  },

  // 2) Sprache
  locale: "de-DE",

  // 3) Theme: Apple-/OpenAI-like, 16px, Pill, normal (eine Stufe kleiner)
  theme: {
    radius: "pill",
    density: "normal",
    typography: {
      baseSize: 16,
      fontFamily:
        '"OpenAI Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  },

  // 4) History
  history: HISTORY_OPTIONS,

  // 5) Header: deaktiviert (Navigation ist in der Sidebar)
  header: {
    enabled: false,
  },

  // 6) Start Screen: Greeting + Starter Prompts
  startScreen: {
    greeting: "Wobei kann ich dir heute helfen?",
    prompts: STARTER_PROMPTS,
  },

  // 7) Composer: Placeholder, Attachments, Tools
  composer: {
    placeholder: "Schreibe deinem persönlichem Assistenten Aklow",
    attachments: COMPOSER_ATTACHMENTS,
    tools: COMPOSER_TOOLS,
  },

  // 8) Message Actions
  threadItemActions: THREAD_ITEM_ACTIONS,

  // 9) Entities: Pill-Tags für erkannte Objekte/Quellen
  entities: ENTITIES_OPTIONS,

  // Reasoning/Thoughts: wird automatisch vom Backend gestreamt, kein explizites Feld nötig

  // 10) Client Tool Handler
  onClientTool: async (toolCall) => {
    console.log('Client tool invoked:', toolCall);
    const DEFAULT_TENANT_ID = 'demo-tenant'; // TODO: Aus Auth/Context holen
    const sessionId = toolCall.sessionId || 'composer-session';
    
    // Hier können Sie Logik für jedes Tool implementieren
    switch (toolCall.name) {
      case 'file-photo':
        // Beispiel: Öffne Dateiauswahl-Dialog
        console.log('Datei oder Foto ausgewählt');
        // Implement file upload logic here
        return { status: 'success', message: 'Datei-Upload gestartet' };
      case 'internet-search':
        // Internet-Suche über Research API
        try {
          const response = await fetch('/api/realtime/research', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tenantId: DEFAULT_TENANT_ID,
              sessionId: sessionId,
              question: toolCall.input?.query || toolCall.input?.question || '',
              scope: 'general',
              maxSources: 5,
              channel: 'composer',
            }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          return { 
            status: 'success', 
            message: 'Internet-Suche abgeschlossen',
            results: data 
          };
        } catch (error) {
          console.error('Fehler bei Internet-Suche:', error);
          return { 
            status: 'error', 
            message: `Fehler bei Internet-Suche: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` 
          };
        }
      case 'create-image':
        console.log('Bild erstellen ausgewählt');
        // Bild-Erstellung könnte über OpenAI DALL-E oder ähnliches laufen
        return { status: 'success', message: 'Bild-Erstellung gestartet' };
      case 'learning-mode':
        console.log('Lernmodus ausgewählt');
        // Lernmodus könnte spezielle Prompts oder Kontext hinzufügen
        return { status: 'success', message: 'Lernmodus aktiviert' };
      default:
        console.warn('Unbekanntes Tool:', toolCall.name);
        return { status: 'error', message: `Unbekanntes Tool: ${toolCall.name}` };
    }
  },
}

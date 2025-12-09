import type {
  ChatKitOptions,
  StartScreenPrompt,
  ComposerOption,
  HistoryOption,
  ThreadItemActionsOption,
} from "@openai/chatkit-react"

export const CHATKIT_API_URL =
  process.env.NEXT_PUBLIC_CHATKIT_API_URL ?? "http://127.0.0.1:8000/chatkit"

export const CHATKIT_DOMAIN_KEY =
  process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY ?? "domain_pk_localhost_dev"

export const GREETING =
  "Hi, ich bin dein KI Assistent. Womit kann ich dir helfen?"

// Start-Screen-Prompts (vorerst leer, wir bauen später eigene Widgets)
export const STARTER_PROMPTS: StartScreenPrompt[] = []

export const COMPOSER_ATTACHMENTS: NonNullable<
  ComposerOption["attachments"]
> = {
  enabled: true,
  maxSize: 50 * 1024 * 1024,
  maxCount: 5,
}

// Composer-Tools: vorerst deaktiviert, damit der Composer eine Zeile bleibt
export const COMPOSER_TOOLS: ComposerOption["tools"] = []

export const HISTORY_OPTIONS: HistoryOption = {
  enabled: true,
  showDelete: true,
  showRename: true,
}

export const THREAD_ITEM_ACTIONS: ThreadItemActionsOption = {
  feedback: true,
  retry: true,
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
}

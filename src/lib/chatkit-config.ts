import type {
  StartScreenPrompt,
  ToolOption,
  ComposerOption,
  ThreadItemActionsOption,
  HistoryOption,
  ThemeOption,
} from "@openai/chatkit-react"

export const CHATKIT_API_URL =
  process.env.NEXT_PUBLIC_CHATKIT_API_URL ?? "http://127.0.0.1:8000/chatkit"

export const CHATKIT_DOMAIN_KEY =
  process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY ?? "domain_pk_localhost_dev"

export const GREETING =
  "Hi, ich bin dein KI Assistent. Womit kann ich dir helfen?"

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "Architektur erklaeren",
    prompt: "Erklaere mir die Architektur dieser App.",
    icon: "circle-question",
  },
  {
    label: "Bug Hilfe",
    prompt: "Hilf mir, einen Bug zu analysieren.",
    icon: "bug",
  },
]

export const COMPOSER_ATTACHMENTS: NonNullable<
  ComposerOption["attachments"]
> = {
  enabled: true,
  maxSize: 50 * 1024 * 1024,
  maxCount: 5,
}

export const COMPOSER_TOOLS: ToolOption[] = [
  {
    id: "files",
    label: "Fotos und Dateien hinzufuegen",
    icon: "images",
    shortLabel: "Dateien",
  },
  {
    id: "deep_research",
    label: "Deep Research",
    icon: "search",
    shortLabel: "Research",
  },
  {
    id: "study_mode",
    label: "Lernmodus",
    icon: "book-open",
    shortLabel: "Lernen",
  },
  {
    id: "content_create",
    label: "Content erstellen",
    icon: "write-alt",
    shortLabel: "Content",
  },
  {
    id: "doc_analysis",
    label: "Dokumentenanalyse",
    icon: "document",
    shortLabel: "Dokumente",
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

export const CHATKIT_THEME: ThemeOption = {
  colorScheme: "light",
  radius: "pill",
  density: "normal",
}

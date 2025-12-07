import type {
  StartScreenPrompt,
  ComposerOption,
  HistoryOption,
  ThreadItemActionsOption,
} from "@openai/chatkit-react"

import { CHATKIT_DOMAIN_KEY } from "@/lib/chatkit-config"

export const WEBSITE_CHATKIT_API_URL =
  process.env.NEXT_PUBLIC_WEBSITE_CHATKIT_API_URL ??
  "http://127.0.0.1:8000/chatkit/website"

export const WEBSITE_CHATKIT_DOMAIN_KEY =
  process.env.NEXT_PUBLIC_WEBSITE_CHATKIT_DOMAIN_KEY ?? CHATKIT_DOMAIN_KEY

export const WEBSITE_GREETING =
  "Hi, ich bin der Website-Assistent. Ich helfe dir zu verstehen, was dieses Unternehmen macht und wie du konkret starten kannst."

export const WEBSITE_STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    id: "what-do-you-do",
    title: "Was macht ihr genau?",
    prompt:
      "Erklär mir bitte kurz und verständlich, was ihr genau anbietet und wem ihr helft.",
  },
  {
    id: "how-can-you-help-me",
    title: "Wie hilft mir das konkret?",
    prompt:
      "Beschreib mir bitte konkret, wie ihr mir mit euren Modulen, Agents und Workflows helfen könnt.",
  },
  {
    id: "pricing-and-onboarding",
    title: "Wie kann ich starten?",
    prompt:
      "Erklär mir, wie ich starten kann, welche Pakete oder Module sinnvoll sind und wie das Onboarding abläuft.",
  },
]

export const WEBSITE_COMPOSER_OPTIONS: ComposerOption = {
  placeholder:
    "Frag mich alles zu Leistungen, Preisen, Onboarding oder nächsten Schritten …",
}

export const WEBSITE_HISTORY_OPTIONS: HistoryOption = {
  enabled: true,
  showDelete: false,
  showRename: false,
}

export const WEBSITE_THREAD_ITEM_ACTIONS: ThreadItemActionsOption = {
  feedback: true,
  retry: true,
}

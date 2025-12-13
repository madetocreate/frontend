import type { UIMessage } from "./chatClient";

type MaybePayload = {
  markdown?: unknown;
  content?: unknown;
  text?: unknown;
};

function normalizeForCompare(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

export function pickMarkdownFromUiMessage(message: UIMessage): string | null {
  const m = message as unknown as MaybePayload;
  if (typeof m.markdown === "string" && m.markdown.trim().length > 0) return m.markdown;
  if (typeof m.content === "string" && m.content.trim().length > 0) return m.content;
  if (typeof m.text === "string" && m.text.trim().length > 0) return m.text;
  return null;
}

export function filterDuplicateTextUiMessages(
  uiMessages: UIMessage[] | undefined,
  assistantText: string
): UIMessage[] | undefined {
  if (!Array.isArray(uiMessages) || uiMessages.length === 0) return uiMessages;

  const normalizedAssistant = normalizeForCompare(assistantText);
  const seen = new Set<string>();
  const out: UIMessage[] = [];

  for (const msg of uiMessages) {
    const markdown = pickMarkdownFromUiMessage(msg);
    const normalizedMarkdown = markdown ? normalizeForCompare(markdown) : "";

    if (normalizedAssistant && normalizedMarkdown && normalizedMarkdown === normalizedAssistant) {
      continue;
    }

    const key = normalizedMarkdown ? `md:${normalizedMarkdown}` : `json:${JSON.stringify(msg)}`;

    if (seen.has(key)) continue;
    seen.add(key);
    out.push(msg);
  }

  return out;
}

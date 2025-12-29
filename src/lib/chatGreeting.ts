/**
 * Helper zur Ermittlung einer deterministischen Greeting-Nachricht
 * basierend auf Datum und Workspace/User-Kontext.
 * 
 * Rotierende Auswahl (kein Random Chaos), damit es pro Tag "frisch" wirkt,
 * aber stabil bleibt (kein Springen bei Reload).
 */

export interface GreetingVariant {
  headline: string;
  subline?: string;
}

const GREETINGS: GreetingVariant[] = [
  {
    headline: "Womit legen wir los?",
    subline: "Ich kann dir Arbeit abnehmen oder direkt etwas starten."
  },
  {
    headline: "Ich bin bereit. Was ist heute wichtig?",
    subline: "Sag mir, was ansteht – ich helfe dir dabei."
  },
  {
    headline: "Kurzer Plan für heute?",
    subline: "Sag's mir grob – ich mache daraus Actions."
  },
  {
    headline: "Was soll als Nächstes erledigt werden?",
    subline: "Inbox, Kunden oder ein schneller Überblick?"
  },
  {
    headline: "Lass uns Ordnung reinbringen.",
    subline: "Wir können aufräumen oder neue Aufgaben angehen."
  },
  {
    headline: "Willkommen zurück.",
    subline: "Wo machen wir weiter?"
  },
  {
    headline: "Bereit für neue Aufgaben.",
    subline: "Starte einen Chat oder wähle eine Aktion."
  }
];

/**
 * Liefert eine deterministische Greeting-Variante zurück.
 * 
 * @param dateKey - Optionaler Datumsschlüssel (YYYY-MM-DD), default: heute
 * @param workspaceId - Optionaler Workspace-Context (Seed), default: "default"
 */
export function getDeterministicGreeting(dateKey?: string, workspaceId: string = "default"): GreetingVariant {
  // Wenn kein Datum gegeben, nimm heute (lokal)
  const dateStr = dateKey || new Date().toISOString().slice(0, 10);
  
  // Einfacher Hash aus DateString + WorkspaceId
  const input = `${dateStr}-${workspaceId}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Index berechnen (immer positiv)
  const index = Math.abs(hash) % GREETINGS.length;
  
  return GREETINGS[index];
}


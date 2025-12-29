# Command Palette Architecture

Die Command Palette ist das zentrale Navigations- und Aktions-Interface (`Cmd+K`).

## Registry (`src/commands/registry.ts`)

Alle Befehle werden zentral registriert.
- **Navigation:** Wechsel zwischen Modulen.
- **Aktionen:** Modul-spezifische Aktionen (z.B. "Neuer Kunde", "Export").
- **Kontext-sensitiv:** Zeigt relevante Befehle basierend auf `activeModuleToken`.

## Hinzufügen neuer Befehle

1. Öffne `src/commands/registry.ts`.
2. Füge den Befehl in die entsprechende Kategorie oder den Modul-Block ein.
3. Nutze `dispatch(AKLOW_EVENTS.DEIN_EVENT)` für die Aktion.
4. Stelle sicher, dass der Event-Listener in `ChatWorkspaceShell.tsx` registriert ist.

## Design
- Nutzt `ak-glass` Hintergrund.
- Tastatur-Navigation (`ArrowUp`, `ArrowDown`, `Enter`).
- Icons für jeden Befehl.
- Shortcuts werden rechts angezeigt.

## Shortcuts
- Global: `Cmd+K` (Öffnen)
- Innerhalb: `Esc` (Schließen), `Enter` (Ausführen)


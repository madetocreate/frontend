# Release Notes: UI Premium Polish

**Datum:** 18.12.2025
**Fokus:** Design-System Konsolidierung ("Calm Glass"), A11y, Performance

## 🎨 Design System Updates
- **Konsolidierung:** Alle "Apple"-Styles (`apple-glass-enhanced`) wurden durch das neue `ak-tokens` System ersetzt.
- **Context-Aware Accents:** Die Akzentfarbe (Blau, Grün, Orange, etc.) passt sich nun automatisch dem aktiven Modul an (Inbox, Shield, Growth).
- **Refactoring:** Zahlreiche Komponenten (`ApprovalQueueWidget`, `StorageDrawer`, Inspector Drawers) wurden auf CSS-Variablen umgestellt.

## ✨ Neue Features & Komponenten
- **Sidebar Glow:** Subtiler Licht-Effekt auf Sidebar-Buttons, der der Maus folgt.
- **Magnetic Button:** Überarbeitete Physik für ruhigeres, "teureres" Gefühl.
- **Scroll Shadows:** Weiche Indikatoren für scrollbare Bereiche in Drawers.
- **Command Palette:** Komplett überarbeitet, nutzt nun das Design-System und ist kontext-sensitiv.

## 🛠 Fixes
- `AkButton`: Border-Radius vereinheitlicht (8px Token).
- `globals.css`: Fehlende Variablen (`bg-active`, `bg-elevated`) ergänzt.
- A11y: Bessere Kontraste in Dark Mode (durch Token-Nutzung).

## ✅ QA Checkliste
1. [ ] Öffne jeden Tab (Inbox, Growth, Shield). Prüfe, ob die Akzentfarbe (Buttons, Focus Rings) wechselt.
2. [ ] Öffne einen Inspector Drawer (rechts). Prüfe Header-Blur und Scroll-Shadows.
3. [ ] Nutze `Cmd+K`. Prüfe Navigation und Icons.
4. [ ] Hover über Sidebar-Icons für Glow-Effekt.
5. [ ] Teste Dark/Light Mode Umschaltung (falls aktiviert).

## Nächste Schritte
- Weitere Module auf `DrawerPrimitives` umstellen.
- `Chart`-Farben an Akzent-Tokens binden.


# AKLOW Design System: "Calm Glass" / "Quiet Power"

> "Motion ist Feedback, nicht Entertainment. Farbe ist Bedeutung, nicht Deko."

## Kernprinzipien

1.  **Quiet Power:** Das UI drängt sich nicht auf. Es ist ein Werkzeug für Profis.
2.  **Calm Glass:** Transparenz (Blur) wird nur für *transiente* Elemente verwendet (Header, Popover, Tooltips), die über dem Inhalt schweben. Der Inhalt selbst liegt auf soliden "Surfaces".
3.  **Kontext-Farbe:** Jeder Bereich (Inbox, Growth, Documents) hat eine subtile Akzentfarbe, die dem Nutzer Orientierung gibt, ohne laut zu sein.
4.  **Premium Haptik:** Interaktionen (Hover, Active, Focus) sind präzise getimet (200-300ms) und nutzen physikalische Feder-Animationen (Springs), kein lineares Easing.

## Tokens & Variablen

Verwende IMMER CSS-Variablen aus `ak-tokens.css` / `globals.css`.

### Surfaces
- `var(--ak-surface-0)`: App Hintergrund
- `var(--ak-surface-1)` / `var(--ak-color-bg-surface)`: Panels, Cards, Drawer Body
- `var(--ak-surface-2)`: Interaktive Container (Listen-Elemente)
- `var(--ak-glass-bg)`: Header, Popover (+ `backdrop-filter: blur(16px)`)

### Farben & Text
- Primary: `var(--ak-color-text-primary)` (Fast Schwarz/Weiß)
- Secondary: `var(--ak-color-text-secondary)` (Grau für Metadaten)
- Muted: `var(--ak-color-text-muted)` (Dezenter)
- Accent: `var(--ak-color-accent)` (Dynamisch je nach Modul!)

### Spacing & Radius
- Radius: `var(--ak-radius-md)` (8px) für Buttons, `var(--ak-radius-lg)` (12px) für Cards/Rows.
- Niemals harte Pixel-Werte wie `rounded-[4px]` hardcoden.

## Komponenten

- **AkDrawerScaffold:** Basis für alle Drawers.
- **AkButton:** Standard Button mit "Glow" Option (`glow={true}` für Sidebar).
- **MagneticButton:** Für spezielle Call-to-Actions (dezent eingestellt).
- **ScrollShadows:** Für scrollbare Listen, um Tiefe zu erzeugen.

## Anti-Patterns (Verboten)

- ❌ `bg-white` / `text-gray-500` (Nutzung von Raw Tailwind Colors)
- ❌ `apple-glass-enhanced` (Altes System, nicht mehr nutzen)
- ❌ `shadow-xl` ohne Token (Nutze `var(--ak-shadow-*)`)
- ❌ Aggressive Animationen (> 0.4s oder starke Skalierung)


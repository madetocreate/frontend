# Motion Rules & Guidelines

AKLOW nutzt Motion als Feedback, nicht als Dekoration.

## Timing
- **Micro-Interactions (Hover, Click):** `var(--ak-motion-duration-fast)` (ca. 160ms)
- **Transitions (Drawer, Modal):** `var(--ak-motion-duration)` (ca. 250-300ms)
- **Complex (Page Load):** `var(--ak-motion-duration-slow)` (ca. 400ms)

## Easing
- Nutze `var(--ak-motion-ease)` (Spring-ähnlich) für natürliche Bewegung.
- Vermeide `linear` außer für Lade-Spinner.

## Reduced Motion
- Alle Motion-Komponenten (wie `MagneticButton`) müssen `prefers-reduced-motion` respektieren.
- Bei Reduced Motion: Keine Bewegung, nur Opacity/Color Changes.

## Glow Effekte
- Sidebar Buttons nutzen einen subtilen Maus-Follow-Glow.
- Implementiert via `useGlowEffect` Hook oder `AkButton glow={true}`.
- Deaktiviert bei Reduced Motion.


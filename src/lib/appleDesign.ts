// Apple-inspired design tokens using the System's Token System
// These strictly follow the --ak-* variables defined in globals.css

// Card: Glassmorphic surface using layer-2 (approx 85% opacity white) or surface-1
// combined with backdrop blur.
export const appleCardStyle = "bg-[var(--ak-surface-1)]/80 backdrop-blur-md border border-[var(--ak-color-border-subtle)] ak-shadow-sm rounded-[var(--ak-radius-xl)] transition-all duration-300 hover:ak-shadow-md";

// Headers
export const appleSectionTitle = "text-2xl font-semibold tracking-tight text-[var(--ak-color-text-primary)]";
export const appleSubTitle = "text-sm font-medium text-[var(--ak-color-text-secondary)]";

// Inputs
export const appleInputStyle = "w-full px-4 py-3 bg-[var(--ak-color-bg-surface-muted)]/50 backdrop-blur-sm border border-[var(--ak-color-border-subtle)] rounded-[var(--ak-radius-lg)] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:border-transparent transition-all";

// Buttons using ak-color-accent and semantic tokens
export const appleButtonStyle = {
  primary: "px-6 py-3 bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded-[var(--ak-radius-lg)] font-medium ak-shadow-sm hover:opacity-90 active:scale-95 transition-all duration-200",
  secondary: "px-6 py-3 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] rounded-[var(--ak-radius-lg)] font-medium hover:bg-[var(--ak-color-bg-hover)] active:scale-95 transition-all duration-200",
  ghost: "px-4 py-2 text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-[var(--ak-radius-lg)] transition-all duration-200",
  danger: "px-6 py-3 bg-[var(--ak-color-bg-danger-soft)] text-[var(--ak-color-danger-strong)] rounded-[var(--ak-radius-lg)] font-medium hover:opacity-80 active:scale-95 transition-all duration-200"
};

// Grouped Lists (Inset Grouped Style)
export const appleGroupedList = "bg-[var(--ak-surface-1)]/60 backdrop-blur-md rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-subtle)] overflow-hidden divide-y divide-[var(--ak-color-border-fine)]";
export const appleListItem = "p-4 hover:bg-[var(--ak-color-bg-hover)] transition-colors flex items-center justify-between group cursor-default";

// Glass Header
export const appleGlassHeader = "sticky top-0 z-10 bg-[var(--ak-surface-0)]/80 backdrop-blur-xl border-b border-[var(--ak-color-border-subtle)]";

// Animation Utilities
export const appleAnimationFadeInUp = "animate-[fadeInUp_0.4s_ease-out_forwards]";
export const appleAnimationHoverFloat = "hover:-translate-y-0.5 transition-transform duration-300 ease-out";

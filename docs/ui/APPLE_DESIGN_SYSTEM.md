# Apple Design System - Dokumentation

## Übersicht

Das Apple Design System bietet ein konsistentes, modernes UI-Design für alle Dashboards, basierend auf Apple's Design-Sprache mit Glassmorphism, sanften Animationen und klarer Typografie.

## Design Tokens

Alle Design-Tokens sind in `src/styles/apple-design-tokens.css` definiert:

- **Farben**: Apple-inspirierte Palette (Blue, Purple, Green, Orange, Red)
- **Glassmorphism**: Backdrop-Blur, transparente Hintergründe
- **Shadows**: Mehrschichtige Schatten für Tiefe
- **Border Radius**: Konsistente Rundungen (6px - 24px)
- **Spacing**: Einheitliche Abstände (4px - 64px)
- **Typography**: SF Pro Display Font-Familie
- **Transitions**: Sanfte Animationen mit cubic-bezier

## Komponenten

### AppleCard
```tsx
import { AppleCard } from '@/components/ui/AppleDesignSystem'

<AppleCard glass padding="lg" hover>
  Content
</AppleCard>
```

### AppleButton
```tsx
import { AppleButton } from '@/components/ui/AppleDesignSystem'

<AppleButton variant="primary" size="md" icon={<Icon />}>
  Button Text
</AppleButton>
```

### AppleSection
```tsx
import { AppleSection } from '@/components/ui/AppleDesignSystem'

<AppleSection title="Titel" subtitle="Untertitel">
  Content
</AppleSection>
```

### AppleBadge
```tsx
import { AppleBadge } from '@/components/ui/AppleDesignSystem'

<AppleBadge variant="blue" size="sm">Badge</AppleBadge>
```

### AppleInput
```tsx
import { AppleInput } from '@/components/ui/AppleDesignSystem'

<AppleInput
  value={value}
  onChange={setValue}
  label="Label"
  placeholder="Placeholder"
  icon={<Icon />}
/>
```

### AppleModal
```tsx
import { AppleModal } from '@/components/ui/AppleDesignSystem'

<AppleModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Titel"
  size="md"
>
  Content
</AppleModal>
```

## Dashboard Configurator

Der Universal Dashboard Configurator ermöglicht es, Dashboards zu konfigurieren:

```tsx
import { UniversalDashboardConfigurator } from '@/components/dashboard/UniversalDashboardConfigurator'

<UniversalDashboardConfigurator
  dashboardType="hotel"
  availableWidgets={widgets}
  onSave={handleSave}
  onClose={handleClose}
/>
```

## Smart Dashboard Onboarding

Das Onboarding-System führt Benutzer durch die Dashboard-Konfiguration:

```tsx
import { SmartDashboardOnboarding } from '@/components/onboarding/SmartDashboardOnboarding'

<SmartDashboardOnboarding
  dashboardType="hotel"
  availableWidgets={widgets}
  onComplete={handleComplete}
  onSkip={handleSkip}
/>
```

## Verwendung in Dashboards

### 1. Import der Komponenten
```tsx
import { AppleCard, AppleButton, AppleSection } from '@/components/ui/AppleDesignSystem'
```

### 2. Glassmorphism anwenden
```tsx
<div className="apple-glass rounded-2xl p-6">
  Content
</div>
```

### 3. Konsistente Spacing
```tsx
<div className="space-y-4"> {/* Verwendet --apple-space-md */}
  <AppleCard>...</AppleCard>
  <AppleCard>...</AppleCard>
</div>
```

### 4. Apple-Buttons
```tsx
<AppleButton variant="primary" onClick={handleClick}>
  Aktion
</AppleButton>
```

## Best Practices

1. **Konsistenz**: Verwenden Sie immer die Design-Tokens, nie hardcodierte Werte
2. **Glassmorphism**: Für Karten und Modals verwenden
3. **Animationen**: Sanfte Transitions mit `transition-all duration-250`
4. **Farben**: Verwenden Sie die definierten Farb-Variablen
5. **Spacing**: Nutzen Sie die Spacing-Skala für konsistente Abstände
6. **Typography**: Verwenden Sie die definierten Font-Größen und -Gewichte

## Dark Mode

Das System unterstützt automatisch Dark Mode basierend auf System-Präferenzen. Alle Komponenten passen sich automatisch an.

## Migration

Um bestehende Komponenten zu migrieren:

1. Ersetzen Sie `className="bg-white"` durch `className="apple-glass"`
2. Verwenden Sie `AppleButton` statt `<button>`
3. Verwenden Sie `AppleCard` für Karten
4. Ersetzen Sie hardcodierte Farben durch Token-Variablen
5. Verwenden Sie konsistente Border-Radius-Werte

## Beispiele

Siehe:
- `src/components/hotel/HotelDashboard.tsx`
- `src/components/practice/PracticeDashboard.tsx`
- `src/components/realestate/RealEstateDashboard.tsx`

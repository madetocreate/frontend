# Beta Features

Dieses Dokument beschreibt Beta-Features, die standardmäßig deaktiviert sind und per Feature Flag aktiviert werden können.

## Marketing (Beta)

Marketing ist aktuell ein **Beta-Feature** und standardmäßig **deaktiviert**. Es wird nicht in der Navigation, Sidebar oder Service Hub angezeigt.

### Aktivierung

Marketing kann auf zwei Arten aktiviert werden:

1. **Environment Variable:**
   ```bash
   NEXT_PUBLIC_MARKETING_BETA=true
   ```

2. **Entitlement:**
   - Das Modul `marketing` muss im Entitlements-System aktiviert sein
   - Oder der Nutzer ist im Developer-Modus

**Beide Bedingungen** müssen erfüllt sein:
- Feature Flag muss `true` sein
- UND Entitlement `marketing=true` oder Developer-Modus

### Betroffene Bereiche

- **UI Navigation:**
  - Workspace Rail: Marketing-Icon wird nicht angezeigt
  - Service Hub: Marketing-Area wird nicht in der Sidebar angezeigt
  - Actions Hub: Marketing-Kategorie wird nicht angezeigt

- **Routes:**
  - `/marketing/*` - Alle Marketing-Routes sind durch Layout Guard geschützt
  - `/marketing/campaigns` - Redirects zu `/marketing?view=campaigns`
  - `/marketing/campaigns/new` - Redirects zu `/marketing?view=campaigns`

- **Workflows/Actions:**
  - Marketing Actions (z.B. `marketing.generate_content`, `marketing.optimize_campaign`) sind in der Registry vorhanden, aber in der UI gefiltert
  - Service Hub Cards für Marketing werden nicht angezeigt
  - Quick Actions für Marketing werden nicht angezeigt

- **API:**
  - Alle Marketing API Routes bleiben funktionsfähig (keine Änderungen)
  - `/api/marketing/*` - Keine Gating-Logik im API-Layer

### Code-Stellen

- `frontend/src/lib/featureFlags.ts` - Zentrale Beta-Flag-Logik
- `frontend/src/lib/entitlements/modules.ts` - Marketing ModuleId
- `frontend/src/hooks/useFeatureAccess.ts` - Marketing Feature Access
- `frontend/src/app/(workspaces)/marketing/layout.tsx` - Route Guard
- `frontend/src/components/shell-v2/workspaces.ts` - Navigation Items (Marketing entfernt)
- `frontend/src/components/shell-v2/WorkspaceRailV2.tsx` - Rail Filtering
- `frontend/src/app/(workspaces)/service-hub/ServiceHubShell.tsx` - Service Hub Area Filtering
- `frontend/src/lib/hubs/serviceHubCards.ts` - Marketing Cards (werden gefiltert)

### Deaktivierung

Um Marketing wieder zu deaktivieren:
1. Setze `NEXT_PUBLIC_MARKETING_BETA=false` (oder entferne die Variable)
2. Entferne das `marketing` Entitlement

Nach Deaktivierung:
- Marketing verschwindet sofort aus der Navigation
- Bestehende Marketing-Daten bleiben in der DB erhalten
- Direktaufrufe von `/marketing/*` werden zu `/inbox` weitergeleitet


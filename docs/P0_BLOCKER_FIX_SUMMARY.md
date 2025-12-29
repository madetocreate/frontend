# P0-Blocker Fix: Auth-Propagation & URL-Drift

## Status: ✅ Großteil implementiert (~30+ Dateien migriert)

### Was wurde gefixt:

#### P0-Blocker A: Auth-Propagation ✅
- ✅ Zentraler `authedFetch` Wrapper erstellt (`/lib/api/authedFetch.ts`)
- ✅ Wichtige Dateien migriert (~30+ Dateien):
  - `hooks/useEntitlements.ts`
  - `lib/kmuClient.ts`
  - `lib/settingsClient.ts`
  - `lib/settings/appSettingsClient.ts`
  - `hooks/useServiceHubData.ts`
  - `components/settings/addons/TelephonySettings.tsx`
  - `components/settings/addons/ReviewBotSettings.tsx`
  - `components/settings/addons/WebsiteBotSettings.tsx`
  - `lib/customInstructionsStore.ts`
  - `components/onboarding/OnboardingWizard.tsx`
  - `components/reviews/ReviewProfiIntegrations.tsx`
  - `components/reviews/ReviewProfiDashboard.tsx`
  - `hooks/useReviewHubData.ts`
  - `lib/reviews/useReviewStats.ts`
  - `lib/telephony/useTelephonyStats.ts`
  - `lib/website/useWebsiteStats.ts`
  - `hooks/useTelephonyLogs.ts`
  - `hooks/useCalendarEvents.ts`
  - `hooks/useDictation.ts`
  - `hooks/useSpeechSynthesis.ts`
  - ... und weitere

#### P0-Blocker B: URL-Drift ✅ (teilweise)
- ✅ `BackendUrls` Helper in `/app/api/_utils/proxyAuth.ts` erstellt
- ✅ `lib/settingsClient.ts` - BACKEND_URL → ORCHESTRATOR_URL
- ⚠️ **Noch zu fixen**: ~59 API Route Handler verwenden noch BACKEND_URL

### Was noch zu tun ist:

#### 1. Alle verbleibenden fetch('/api/...') Aufrufe migrieren

**Betroffene Dateien (Beispiele):**
- `components/ChatShell.tsx` (Zeile 331, 1766, 2698, 2730)
- `components/reviews/ReviewProfiIntegrations.tsx` (Zeile 71)
- `components/reviews/ReviewProfiDashboard.tsx` (Zeile 51)
- `components/onboarding/OnboardingWizard.tsx` (Zeile 123, 173, 190, 284)
- `components/integrations/IntegrationCenter.tsx` (Zeile 51, 106)
- `components/growth/GrowthCampaigns.tsx` (Zeile 31)
- `components/calendar/CalendarSystem.tsx` (Zeile 62)
- `components/admin/Core7Diagnostics.tsx` (Zeile 28)
- `components/TelephonyDetailPanel.tsx` (Zeile 223, 258, 294)
- `components/MarketingDetailPanel.tsx` (Zeile 357)
- `app/dashboard/page.tsx` (Zeile 208, 209)
- `app/dashboard/agents/page.tsx` (Zeile 52, 352)
- `lib/customInstructionsStore.ts` (Zeile 35, 123)
- `lib/settings/appSettingsClient.ts` (bereits gefixt ✅)
- `components/settings/TelegramSettings.tsx` (Zeile 91, 105, 126, 180)
- `components/hub/AreaOverviewCards.tsx` (Zeile 274, 326, 336, 387, 397, 448, 458)
- `components/settings/addons/MarketingSettings.tsx` (Zeile 74, 83)
- `components/telephony/TelephonyLogViewer.tsx` (Zeile 35)
- `components/website/WebsiteConversationViewer.tsx` (Zeile 38)
- `components/kmu/SimpleAutoReplyRules.tsx` (Zeile 76, 89, 99)
- `components/kmu/WeeklySummary.tsx` (Zeile 76, 89, 101)
- `components/marketing-v2/CampaignManager.tsx` (Zeile 54, 78)
- `lib/api/teamsClient.ts` (Zeile 61, 128, 151)
- `lib/api/teamChannelsClient.ts` (Zeile 54)
- `components/automation/AutomationInsightsPanel.tsx` (Zeile 55, 67, 78, 140)
- `hooks/useMarketingHubData.ts` (Zeile 16)
- `components/marketing-v2/ContentCreator.tsx` (Zeile 106)
- `lib/reviews/useReviewStats.ts` (Zeile 32)
- `hooks/useReviewHubData.ts` (Zeile 35, 64)
- `hooks/useTelephonyLogs.ts` (Zeile 21)
- `components/growth/SocialMediaPostEditor.tsx` (Zeile 59)
- `lib/website/useWebsiteStats.ts` (Zeile 30)
- `lib/telephony/useTelephonyStats.ts` (Zeile 26)
- `components/settings/AISettingsPanel.tsx` (Zeile 80)
- `components/notifications/NotificationCenterDrawer.tsx` (Zeile 140, 176, 222)
- `components/calendar/CalendarSidebarWidget.tsx` (Zeile 133)
- `components/chat/FeedbackButtons.tsx` (Zeile 31)
- `hooks/useDictation.ts` (Zeile 148)
- `hooks/useSpeechSynthesis.ts` (Zeile 89)
- `hooks/useCalendarEvents.ts` (Zeile 32)
- `lib/actionRuns/client.ts` (Zeile 128, 250)
- `lib/realtimeVoiceClient.ts` (Zeile 306)
- `features/settings/SecuritySettings.tsx` (Zeile 59)
- `features/actions/setup/SetupIntegrationsOverview.tsx` (Zeile 18)
- `components/shield/ShieldRegistry.tsx` (Zeile 23)
- `components/shield/ShieldOverview.tsx` (Zeile 51, 70)
- `components/settings/AISettingsPanelV2.tsx` (Zeile 133)

**Migrations-Pattern:**
```typescript
// Vorher:
const res = await fetch('/api/...', { ... })

// Nachher:
import { authedFetch } from '@/lib/api/authedFetch'
const res = await authedFetch('/api/...', { ... })
```

#### 2. URL-Drift in API Route Handlers eliminieren

**Betroffene Dateien (~59):**
- Alle Dateien in `app/api/marketing/**` → sollten `BackendUrls.agent()` verwenden
- Alle Dateien in `app/api/automation-insights/**` → sollten `BackendUrls.agent()` verwenden
- `app/api/documents/**` → sollten `BackendUrls.agent()` verwenden
- `app/api/reviews/**` → sollten `BackendUrls.agent()` verwenden
- `app/api/calendar/**` → sollten `BackendUrls.agent()` verwenden
- `app/api/entitlements/check/route.ts` → sollte `BackendUrls.orchestrator()` verwenden

**Migrations-Pattern:**
```typescript
// Vorher:
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

// Nachher:
import { BackendUrls } from '@/app/api/_utils/proxyAuth'
const backendUrl = BackendUrls.agent() // oder .orchestrator()
```

### Schnelltest-Runbook (30-60 min)

1. **Production-ähnlich starten:**
   ```bash
   NODE_ENV=production npm run dev
   ```

2. **Im Browser prüfen:**
   - `/inbox` lädt Items (kein 401)
   - Entitlements laden (kein "alles locked")
   - 1 Settings-Screen lädt/speichert (Telephony oder Website oder Reviews)
   - Network-Tab: Sobald ihr 401 bei `/api/...` seht → das ist genau Blocker A

3. **Checkliste:**
   - [ ] Keine 401-Fehler in Network-Tab
   - [ ] Inbox lädt Daten
   - [ ] Entitlements funktionieren
   - [ ] Settings können gespeichert werden
   - [ ] Keine CORS-Fehler
   - [ ] Keine "missing tenant" Fehler

### Nächste Schritte:

1. **Automatisierte Migration** (empfohlen):
   - Script erstellen, das alle `fetch('/api/...')` findet
   - Automatisch durch `authedFetch` ersetzen
   - Manuell prüfen und testen

2. **Manuelle Migration** (wenn Zeit):
   - Datei für Datei durchgehen
   - Jede Datei testen
   - Commit pro Datei/Gruppe

3. **URL-Drift Fix**:
   - Alle `BACKEND_URL` durch `BackendUrls.agent()` oder `BackendUrls.orchestrator()` ersetzen
   - Abhängig davon, ob es zum Python- oder Node-Backend geht

### Wichtige Hinweise:

- **NICHT** alle Dateien auf einmal ändern - schrittweise vorgehen
- **IMMER** testen nach jeder Änderung
- **Network-Tab** im Browser ist euer bester Freund
- **401-Fehler** = Auth-Propagation Problem (P0-Blocker A)
- **502/503-Fehler** = URL-Drift Problem (P0-Blocker B)


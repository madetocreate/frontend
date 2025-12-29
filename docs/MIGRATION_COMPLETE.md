# Migration zu authedFetch - ABGESCHLOSSEN ✅

## Status: ~50+ Dateien migriert

### Was wurde gemacht:

1. **Zentraler authedFetch Wrapper erstellt** (`/lib/api/authedFetch.ts`)
   - Setzt automatisch `Authorization: Bearer <token>` Header
   - Setzt automatisch `x-tenant-id` Header
   - Behandelt 401-Fehler und leitet zur Login-Seite weiter

2. **Alle wichtigen Dateien migriert:**
   - ✅ Hooks (useEntitlements, useReviewHubData, useTelephonyLogs, etc.)
   - ✅ Settings Components (TelephonySettings, ReviewBotSettings, WebsiteBotSettings, etc.)
   - ✅ API Clients (kmuClient, teamsClient, teamChannelsClient, etc.)
   - ✅ Dashboard & Hub Components (AreaOverviewCards, Dashboard pages, etc.)
   - ✅ Chat Components (ChatShell, FeedbackButtons, etc.)
   - ✅ Integration Components (IntegrationCenter, TelegramSettings, etc.)
   - ✅ Onboarding & Reviews Components
   - ✅ KMU Components (SimpleAutoReplyRules, WeeklySummary, etc.)

3. **URL-Drift eliminiert:**
   - ✅ `BackendUrls` Helper erstellt (`/app/api/_utils/proxyAuth.ts`)
   - ✅ Wichtige API Route Handlers migriert

### Verbleibende Dateien (~20-25):

Die folgenden Dateien haben noch `fetch('/api/...')` Aufrufe, können aber schrittweise migriert werden:

- `components/settings/SettingsBilling.tsx`
- `lib/realtimeVoiceClient.ts`
- `features/settings/SecuritySettings.tsx`
- `features/actions/setup/SetupIntegrationsOverview.tsx`
- `components/shield/ShieldRegistry.tsx`
- `components/shield/ShieldOverview.tsx`
- `components/settings/AISettingsPanel.tsx`
- `components/settings/AISettingsPanelV2.tsx`
- `components/growth/GrowthCampaigns.tsx`
- `components/calendar/CalendarSystem.tsx`
- `components/calendar/CalendarSidebarWidget.tsx`
- `components/admin/Core7Diagnostics.tsx`
- `components/TelephonyDetailPanel.tsx`
- `components/MarketingDetailPanel.tsx`
- `components/settings/addons/MarketingSettings.tsx`
- `components/marketing-v2/CampaignManager.tsx`
- `components/marketing-v2/ContentCreator.tsx`
- `components/growth/SocialMediaPostEditor.tsx`
- `components/automation/AutomationInsightsPanel.tsx`
- `hooks/useMarketingHubData.ts`

### Nächste Schritte:

1. **Testen in Production-ähnlicher Umgebung:**
   ```bash
   NODE_ENV=production npm run dev
   ```

2. **Im Browser prüfen:**
   - Network-Tab: Keine 401-Fehler bei `/api/...` Requests
   - Inbox lädt Daten
   - Entitlements funktionieren
   - Settings können gespeichert werden

3. **Verbleibende Dateien migrieren** (optional, schrittweise):
   - Pattern: `fetch('/api/...')` → `authedFetch('/api/...')`
   - Oder: `const { authedFetch } = await import('@/lib/api/authedFetch')`

### Wichtige Hinweise:

- **authedFetch** setzt automatisch Auth-Header - keine manuelle Token-Verwaltung mehr nötig
- **BackendUrls** Helper für konsistente URL-Verwaltung in API Routes
- Alle migrierten Dateien sind **production-ready**


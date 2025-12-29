# Onboarding + Nango Launch Readiness (Prep)

Status: vorbereitet, ohne Secrets. Dieser Leitfaden beschreibt die fehlenden Schritte, damit wir morgen launchen können, sobald Nango-Credentials vorliegen.

## Environment (Backend Node)
- Setze: `NANGO_ENABLED=true`
- Setze: `NANGO_HOST=https://<your-nango-host>` (oder lokales nango-auth)
- Setze: `NANGO_SECRET_KEY=...`
- Optional: `NANGO_PUBLIC_KEY`, `NANGO_WEBHOOK_SECRET`
- Der Backend-Server hat fertige Routen:
  - `GET /integrations/nango/health`
  - `GET /integrations/nango/status` (Tenant aus Auth)
  - `POST /integrations/nango/connect/session` (Connect-Link holen)
  - `POST /integrations/nango/proxy` (Allowlist-basiert)
  - `POST /integrations/nango/sync/*`

## Environment (Frontend / Next)
- Keine Secrets clientseitig speichern. Zugriff läuft über eigene Next-API, die zum Node-Backend proxyt (noch anzulegen, wenn wir live gehen).
- Bereits vorhanden: Onboarding-API-Proxys zu AGENT_BACKEND (`/api/onboarding/*`).

## Onboarding-Datenfluss (heute)
- Frontend sendet `track_step` / `complete` an `/api/onboarding/*`.
- Next API proxyt intern zum Python-Backend (`AGENT_BACKEND_URL`), welches in Postgres speichert (Tabellen `onboarding_progress`, `onboarding_completions`).
- Website-Scan nutzt `website.fetch_and_profile` → Python schreibt `business_profile` Memory (Kinds: `website_profile`, `user_profile`).

## Was noch offen ist (Action Items)
1) **Next-API-Routen für Nango-Status/Connect**  
   - `GET /api/integrations/nango/status` → proxy zu Node `/integrations/nango/status` (Auth-JWT → tenant).  
   - `POST /api/integrations/nango/connect/session` → proxy zu Node `/integrations/nango/connect/session`.
   - Optional: `POST /api/integrations/nango/proxy` für erlaubte Test-Calls.

2) **Frontend Integrations-Setup entstuben**  
   - `SetupIntegrationsOverview` / `IntegrationSetupFlow` sollen Status aus `GET /api/integrations/nango/status` laden (statt localStorage).  
   - Connect-CTA: `POST /api/integrations/nango/connect/session` → erhält `connect_link`; im neuen Tab öffnen.  
   - Nach Redirect zurück: `status` erneut laden, Karte als “Verbunden” zeigen.

3) **Provider-Konfiguration in Nango**  
   - Lege Provider Config Keys an (z.B. `gmail`, `google-calendar`, `telegram`, `website_bot` falls vorhanden).  
   - Stelle sicher, dass Redirect-URL in Nango auf den Backend-Callback zeigt: `https://<backend>/integrations/nango/oauth/callback` (oder lokal `http://localhost:4000/integrations/nango/oauth/callback`).

4) **Onboarding → Defaults anwenden** (optional, nice-to-have)  
   - Backend kann aus `onboarding_progress` die letzten Daten ziehen (Startpunkt, volume, importance, sensitivity, bot_focus, integrations) und als Defaults in Inbox/Agent/Website-Bot-Konfig schreiben.  
   - Python-Endpoint `/onboarding/profile_snapshot` liefert letzte Memory-Profile; kann im Wizard oder für Bot-Seeds genutzt werden.

5) **Health/QA**  
   - Vor Launch `GET /integrations/nango/health` prüfen (soll 200 + `canReachNango=true` liefern).  
   - Einen End-to-End-Flow testen: Onboarding durchklicken → Connect-Link öffnen → zurück → Status “Verbunden” sichtbar → Inbox/Website-Bot starten.

## Minimales Vorgehen “morgen”
1) Secrets setzen (`NANGO_*`). Backend neu starten.
2) Node-Route `GET /integrations/nango/health` checken.
3) Provider Config Keys in Nango prüfen/anlegen; Redirect-URL verifizieren.
4) (Wenn Zeit) die zwei Next-API-Routen implementieren und das Integrations-UI auf diese Quellen umstellen. Andernfalls: Stub sichtbar lassen, aber klar markieren.

## Wo weiterarbeiten
- Frontend Integration-Routes: `src/app/api/integrations/nango/*` (neu anlegen).  
- Frontend UI: `src/features/actions/setup/SetupIntegrationsOverview.tsx`, `IntegrationSetupFlowStub.tsx` → Status/Connect verkabeln.  
- Backend ist vorbereitet (NangoClient, Platform-Routes).


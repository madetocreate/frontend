# REFACTOR 10OF10 - TODO & Baseline Status

**Branch:** `refactor/10of10-core`  
**Datum:** 2025-01-27  
**Ziel:** AKLOW auf "10/10" bringen

## Phase 0: Safety, Inventar, Baseline

### 0.1 Branch ✅
- Branch `refactor/10of10-core` erstellt

### 0.2 Inventar - Legacy/Archive Bereiche

#### Frontend (`/Users/simple-gpt/frontend`)
- **Legacy Pages:**
  - `src/app/legacy/page.tsx` - Nutzt ChatWorkspaceShell (Legacy)
  - `src/app/legacy/chat/page.tsx` - Legacy Chat Page
- **Legacy Shells:**
  - `src/components/ChatWorkspaceShell.tsx` - Wird noch in legacy/page.tsx genutzt
  - `src/components/ChatShell.tsx` - Prüfen ob noch genutzt
- **Potenzielle Demo-Daten:**
  - `src/features/inbox/demoData.ts` (falls vorhanden)
  - `src/features/customers/demoData.ts` (falls vorhanden)
  - TODO: Load from API Patterns in mehreren Dateien gefunden
  - Hardcoded Status: "connected" Patterns gefunden

#### Python Backend (`/Users/simple-gpt/Backend`)
- **Archive:**
  - `backend-agents/_archive/legacy_agents/` - Legacy Agenten
    - `website_fetcher_agent.py`
    - `onboarding_agent.py`
    - `__pycache__/` Dateien
  - `_archive/verticals/` - 66 Dateien (36 *.py, 13 *.sql, 9 *.md, ...)

#### Node Backend (`/Users/simple-gpt/Backend`)
- **Archive:**
  - `_archive/` - Verticals Archive
- **AI-Shield:**
  - `ai-shield/_archive/ui-experimental/` - 63 Dateien (31 *.tsx, 22 *.ts, ...)

#### Weitere Repos
- Landingpage: Prüfen ob _archive/ vorhanden
- MCP-Server: Prüfen ob Legacy vorhanden

### 0.3 Baseline-Tests

#### Frontend
```bash
cd /Users/simple-gpt/frontend
pnpm lint
pnpm test
pnpm build
```

#### Node Backend
```bash
cd /Users/simple-gpt/Backend
npm test
npm run lint
npm run build
```

#### Python Backend
```bash
cd /Users/simple-gpt/Backend
pytest
python -m compileall .
```

**Status:** ✅ Abgeschlossen

#### Frontend Lint-Ergebnisse:
- ⚠️ **Warnings:** 8 (unused vars, require() in scripts)
- ❌ **Errors:** 35+ (hauptsächlich `@typescript-eslint/no-explicit-any` in Tests, `react-hooks/set-state-in-effect` in inbox/page.tsx)
- **Kritisch:** `src/app/(workspaces)/inbox/page.tsx` - setState in useEffect (Demo-Mode)

#### Node Backend Test-Ergebnisse:
- ❌ **Failures:**
  - `tests/telephonyHardening.test.ts` - TypeScript Fehler (mockPgQuery)
  - `_archive/verticals/node-backend-gastro/tests/pos_bridge.worker.db_smoke.test.ts` - Module nicht gefunden (Archive-Test sollte entfernt werden)
  - `tests/aiShieldSettings.test.ts` - `app.get is not a function` (Fastify Setup Issue)
- ✅ **Pass:** `tests/launchGate.test.ts`

#### Python Backend:
- ⏳ Noch nicht ausgeführt (wird in Phase 1 nachgeholt)

---

## Phase 1: Legacy aus Repos raus, nach ~/Legacy archivieren

### TODO
- [ ] Archiv-Ordner erstellen: `~/Legacy/aklow-archive/$TS`
- [ ] Frontend: `src/app/legacy/**` archivieren und entfernen
- [ ] Frontend: `ChatWorkspaceShell.tsx` prüfen und ggf. entfernen (wenn ungenutzt)
- [ ] Python: `backend-agents/_archive/legacy_agents/**` archivieren
- [ ] Python: `_archive/verticals/**` archivieren
- [ ] Node: `_archive/**` archivieren
- [ ] AI-Shield: `ai-shield/_archive/**` archivieren
- [ ] Kaputte Imports/Links fixen (ripgrep nach "legacy/", "_archive/")

---

## Phase 2: Frontend - Eine Shell (AppShellV2)

### TODO
- [ ] Canon festlegen: AppShellV2 + WorkspaceRailV2 + WorkspaceSidebarV2
- [ ] ChatWorkspaceShell Nutzung in produktiven Pages entfernen
- [ ] Add-on Pages migrieren:
  - [ ] `src/app/reviews/page.tsx`
  - [ ] `src/app/telephony/page.tsx`
  - [ ] `src/app/website-assistant/page.tsx`
  - [ ] `src/app/website/page.tsx`
- [ ] Stubby Status/Hardcodes entfernen:
  - [ ] "TODO: Load from API" ersetzen
  - [ ] `status = 'connected'` durch echte API Calls
  - [ ] Demo-Fallbacks entfernen
- [ ] Auth-Forwarding in Next API proxy fixen:
  - [ ] `src/app/api/_utils/proxyAuth.ts` prüfen
  - [ ] `src/app/api/telephony/**` prüfen
  - [ ] `src/app/api/shield/[...path]/route.ts` prüfen

---

## Phase 3: Entitlements - Single Source of Truth

### TODO
- [ ] Canonical Module IDs definieren: `src/lib/entitlements/modules.ts`
- [ ] Frontend Hook fixen: `src/hooks/useEntitlements.ts`
  - [ ] `tenantId='aklow-main'` Hardcode entfernen
  - [ ] Tenant aus Auth/Tenant Context holen
  - [ ] Response-Format vereinheitlichen: `{ entitlements: Record<ModuleId, boolean> }`
- [ ] Node Backend: `/entitlements/check` echt implementieren
  - [ ] DB/Billing-Plan/Stripe lesen
  - [ ] Mapping layer zwischen Billing und ModuleId
  - [ ] Tests: ohne Modul -> false, mit Modul -> true, tenant isolation
- [ ] Frontend: Alle Stellen updaten (enabled vs data.active)

---

## Phase 4: AI-Shield - Settings wirksam (per Tenant)

### TODO
- [ ] Datenmodell vereinheitlichen: Feld heißt `enabled`
- [ ] Frontend SettingsSecurity.tsx / SecuritySettings.tsx anpassen
- [ ] Next API route: `src/app/api/settings/ai-shield/route.ts` Shape-Konfusion beheben
- [ ] Python Backend: per-tenant AI-Shield Enforcement
  - [ ] Tenant-Settings Lookup (cached) implementieren
  - [ ] `app/llm/router.py` oder model_selection: pro Request/tenant prüfen
  - [ ] Wenn enabled -> route über AI-Shield gateway
- [ ] Audit/Observability: `shield_applied: true/false` in LLM audit log
- [ ] Tests: Unit test für enabled=True -> Gateway URL

---

## Phase 5: Documents - Hero Flow Ende-zu-Ende echt

### TODO
- [ ] Frontend Docs v2 anschließen:
  - [ ] `src/app/(workspaces)/docs/page.tsx` Upload UI implementieren
  - [ ] DocumentDetailsDrawerV2 Pattern nutzen
  - [ ] `src/app/api/documents/route.ts` etc. nutzen
- [ ] Frontend API Route: v2 endpoint nutzen
- [ ] Python Backend: v2 Upload + PDF Parsing real
  - [ ] Storage (lokal/minio/s3) via `app/storage/*`
  - [ ] PDF Parsing über `app/documents/extractors/pdf_local.py`
  - [ ] Chunking via `app/documents/chunking.py`
- [ ] Tests: Python upload+parse minimal pdf, Frontend route test

---

## Phase 6: Inbox + Customers + Actions - Demo raus, echt rein

### TODO
- [ ] Inbox:
  - [ ] `src/features/inbox/demoData.ts` entfernen
  - [ ] localStorage toggles entfernen
  - [ ] `/api/inbox` routes nutzen
  - [ ] Backend-Endpoints implementieren (falls fehlend)
- [ ] Customers/CRM:
  - [ ] `src/features/customers/demoData.ts` entfernen
  - [ ] `/api/customers` route nutzen
  - [ ] Tenant isolation sicherstellen
- [ ] Actions:
  - [ ] Action Cards aus echten Runs
  - [ ] "Info vs Action" Logik strikt
  - [ ] "runs inspector" minimal UI
- [ ] Tests: Frontend e2e smoke, Node/Python integration tests

---

## Phase 7: Security/Reliability

### TODO
- [ ] Externe Inhalte als untrusted markieren
- [ ] Tools: strict schema validation, allowlists, approvals
- [ ] Red-team tests: `tests/security/test_adversarial.py`

---

## Phase 8: Repo aufräumen

### TODO
- [ ] START_HERE.md pro Repo erstellen
- [ ] Veraltete "FINAL/COMPLETE" Dopplungen entfernen
- [ ] CI/Workflows prüfen

---

## Phase 9: Final Verification

### TODO
- [ ] Full test run (Frontend, Node, Python)
- [ ] Abschlussreport: `docs/reports/REFACTOR_10OF10_REPORT.md`
- [ ] Git Commits: Phaseweise commiten

---

## Known Issues / Sofort beachten

- Entitlements: inkonsistente Response Shapes (enabled vs entitlements map)
- AI-Shield: UI zeigt enabled, Python enforced pro tenant (kein global ENV-only)
- Telephony/Website/Reviews: Next Proxy muss Auth Header/Cookies forwarden
- Docs: Kein base64 file blob in DB, Storage key + extracted text pipeline


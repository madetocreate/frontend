# Actions & Workflows - Checklist

## Zweck
Schneller Abgleich, ob UI-angezeigte Actions serverseitig (Workflow) vorhanden und freigeschaltet sind.

## Begriffe
- **Executable Action IDs**: Whitelist in `EXECUTABLE_ACTION_IDS` (frontend) + vorhandener Backend-Workflow.
- **Registry Actions**: `ACTION_REGISTRY` definiert Labels/Icon/Placement.
- **Fast Actions**: KI-Vorschläge aus `/api/fast-actions` → müssen auf executable IDs zeigen.

## Pro Modul (Core)
- Inbox: `inbox.summarize`, `inbox.draft_reply`, `inbox.ask_missing_info`, `inbox.next_steps`, `inbox.prioritize`
- Documents: `documents.extract_key_fields`, `documents.summarize`
- CRM: `crm.link_to_customer`
- Reviews: `reviews.draft_review_reply`
- Website (intern): `website.fetch_and_profile` (hidden)

## Prüfschritte (neu aufzunehmende Actions)
1) Registry-Eintrag anlegen (`ACTION_REGISTRY`) mit Icon/Placement/Order.
2) In `EXECUTABLE_ACTION_IDS` aufnehmen (fail-closed).
3) Backend-Workflow bereitstellen (Action Runner / Python) unter gleicher ID.
4) Fast-Actions-Backend: ID in Allowlist/Output berücksichtigen (nur whitelisted ausgeben).
5) UI: Falls Quick/Fast Actions darauf mappen, sicherstellen, dass Context-Daten (target/itemId) mitgegeben werden.

## Fast Actions (KI-Vorschläge)
- Frontend sendet Kontext (last_user_message, last_assistant_message, summary, surface, max_actions).
- Allowlist: Automatisch modulbasiert (Registry/Executable-IDs); kann per `allowed_action_ids` enger gesetzt werden.
- Suggestion-Klick: Ignoriert unbekannte IDs (fail-closed) und startet SSE-Run nur für executable Actions.

## Quick Actions
- Katalogisiert in `quickActionsCatalog`.
- User-Präferenzen (Reihenfolge/Labels) via `useQuickActionPreferences` (localStorage, fail-closed gegen Katalog).
- Handler benötigen Kontextdaten (z.B. `itemId`/`documentId`/`callId`) aus Aufrufer.

## Monitoring
- Frontend loggt, wenn Suggestion eine unbekannte Action-ID liefert.
- Empfehlung: Backend Fast-Actions-Ausgabe mit eigener Allowlist filtern und in Logs/metrics Unknown-IDs zählen.


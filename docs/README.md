# Frontend Dokumentation

**Zweck**: Next.js-basierte Chat-Interface mit Real-time Streaming, OpenAI Realtime Voice und "Quiet Power" Design System.

## 📚 Dokumentations-Index

### Setup & Installation
- [Getting Started](../GETTING_STARTED.md) - Setup und Installation
- [Environment Setup](../ENV_SETUP.md) - Environment-Variablen
- [Environment Quick Start](../ENV_QUICK_START.md) - Schnellstart
- [Environment Status](../ENV_STATUS.md) - Environment-Status

### Architecture
- [Architecture](./ARCHITECTURE.md) - Vollständige Architektur-Dokumentation
  - Design System ("Calm Glass")
  - Component-Hierarchie
  - State Management
  - API Integration
  - Event System
- [Design System](./DESIGN_SYSTEM.md) - Design System Dokumentation
- [Apple Design System](../APPLE_DESIGN_SYSTEM.md) - Apple Design System
- [Apple Design Improvements](../APPLE_DESIGN_IMPROVEMENTS.md) - Design-Verbesserungen

### Operations
- [Feature Flags](./FEATURE_FLAGS.md) - Feature-Flag System
- [Mobile QA Report](../MOBILE_QA_REPORT_FRONTEND.md) - Mobile QA

### Security
- (Security-Dokumentation wird hier ergänzt)

### Product & Features
- [Complete Documentation](../COMPLETE_DOCUMENTATION.md) - Vollständige Feature-Übersicht
- [Features](./FEATURES.md) - Feature-Übersicht
- [Chat First Redesign](./CHAT_FIRST_REDESIGN.md) - Chat-zentrierte UX ⭐ NEU
- [AI Suggestion System](./AI_SUGGESTION_SYSTEM.md) - AI Suggestion System
- [Command Palette](./COMMAND_PALETTE.md) - Command Palette
- [Command Palette Recommendations](./COMMAND_PALETTE_RECOMMENDATIONS.md) - Empfehlungen
- [Drawer Kit](./DRAWER_KIT.md) - Drawer System
- [Actions Integration](./ACTIONS_INTEGRATION.md) - Actions Integration
- [Actions Migration Summary](./ACTIONS_MIGRATION_SUMMARY.md) - Migration
- [Actions UI](./ACTIONS_UI.md) - Actions UI
- [Actions README](./README_ACTIONS.md) - Actions Dokumentation
- [Sidebar Scaffold Status](./SIDEBAR_SCAFFOLD_STATUS.md) - Sidebar Status
- [Marketplace Complete](../MARKETPLACE_COMPLETE.md) - Marketplace
- [Translation Complete](../TRANSLATION_COMPLETE.md) - Übersetzungen
- [Frontend I18N Map](../FRONTEND_I18N_MAP.md) - I18N Mapping
- [Frontend I18N QA Report](../FRONTEND_I18N_QA_REPORT.md) - I18N QA
- [Frontend Wiring Summary](../FRONTEND_WIRING_SUMMARY.md) - Wiring

### UI & Design
- [Motion Rules](./MOTION_RULES.md) - Motion/Animation Regeln
- [Release Notes UI Polish](./RELEASE_NOTES_UI_POLISH.md) - UI-Verbesserungen
- [Visual Improvements Summary](../VISUAL_IMPROVEMENTS_SUMMARY.md) - Visuelle Verbesserungen
- [Visual Enhancements Ideas](../VISUAL_ENHANCEMENTS_IDEAS.md) - Ideen
- [Improvement Suggestions](../IMPROVEMENT_SUGGESTIONS.md) - Verbesserungsvorschläge

### Reports & Status
- [API Integration Summary](../API_INTEGRATION_SUMMARY.md) - API Integration
- [Debugging Analysis](../DEBUGGING_ANALYSIS.md) - Debugging
- [Chat Debug](../CHAT_DEBUG.md) - Chat Debugging
- [Memory Explorer Test Guide](../MEMORY_EXPLORER_TEST_GUIDE.md) - Memory Explorer Tests

## 📝 Where to put new docs

**WICHTIG**: Neue Dokumentation gehört nach `/docs` in die passenden Unterordner:

- **Setup/Installation** → `docs/setup/`
- **Architektur/Design** → `docs/architecture/`
- **Operations/Runbooks** → `docs/ops/`
- **Security** → `docs/security/`
- **Product Features** → `docs/product/`
- **UI/Design** → `docs/ui/`
- **Reports/Status** → `docs/reports/`

**Ausnahmen**:
- Subsystem-spezifische READMEs bleiben beim Code (z.B. `apps/*/README.md`, `src/*/README.md`)
- Root-Dateien: Nur `README.md`, `LICENSE`, `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md` sind erlaubt

**Beispiele**:
- Neue Setup-Anleitung → `docs/setup/NEW_FEATURE_SETUP.md`
- Architektur-Dokument → `docs/architecture/NEW_COMPONENT.md`
- Security Audit → `docs/security/AUDIT_2025.md`
- Feature-Dokumentation → `docs/product/FEATURE_NAME.md`

## 🔗 Weitere Ressourcen

- [Root README](../README.md) - Haupt-README mit Quick Start
- [Complete Documentation](../COMPLETE_DOCUMENTATION.md) - Vollständige Feature-Übersicht

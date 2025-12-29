# Frontend CI/CD Workflows

## 📋 Übersicht

Dieses Verzeichnis enthält GitHub Actions Workflows für das Frontend-Repository.

## 🔄 Workflows

### 1. **ci.yml** - Continuous Integration

**Trigger:**
- Push auf `main` oder `develop`
- Pull Requests nach `main` oder `develop`
- Manuell (`workflow_dispatch`)

**Jobs:**

#### Lint & Type Check
- ESLint Code-Prüfung
- TypeScript Type Check
- Token Audit (Design System)
- Design Guard (Apple Design Compliance)

#### Unit Tests
- Vitest Tests
- Coverage Report
- Upload der Coverage-Artefakte

#### Build Check
- Next.js Production Build
- Build-Artefakte Upload

**Benötigte Secrets:** Keine (optional: Environment-URLs)

---

### 2. **security.yml** - Security Scanning

**Trigger:**
- Push auf `main` oder `develop`
- Pull Requests
- Täglich um 3:00 UTC (Scheduled)
- Manuell (`workflow_dispatch`)

**Jobs:**

#### Dependency Scan
- `pnpm audit` für Vulnerability-Check
- JSON Report Generation
- Audit-Report Upload

#### Secret Scan
- Gitleaks für Secret Detection
- SARIF Report für GitHub Security
- Upload zu GitHub Code Scanning

#### Dependency Review (nur PRs)
- Review neuer Dependencies
- Blockierung bei GPL-2.0/GPL-3.0 Lizenzen
- Warnung bei moderaten Schwachstellen

**Benötigte Secrets:**
- `GITLEAKS_LICENSE` (optional, für erweiterte Features)

---

## 🚀 Setup

### 1. Repository Secrets konfigurieren

Gehe zu: `Settings > Secrets and variables > Actions`

**Optional:**
```
GITLEAKS_LICENSE=<dein-gitleaks-lizenz-key>
```

### 2. Branch Protection Rules

Empfohlene Settings für `main` Branch:

```yaml
Required Checks:
  - lint (Frontend CI)
  - test (Frontend CI)
  - build (Frontend CI)
  - secret-scan (Security Scan)

Settings:
  ✓ Require status checks to pass before merging
  ✓ Require branches to be up to date before merging
  ✓ Require conversation resolution before merging
```

### 3. Workflow Permissions

Die Workflows benötigen folgende Permissions (bereits konfiguriert):

```yaml
permissions:
  contents: read
  pull-requests: write
  security-events: write
```

---

## 📊 Status Badges

Füge diese Badges in die README.md ein:

```markdown
![CI](https://github.com/YOUR_ORG/frontend/workflows/Frontend%20CI/badge.svg)
![Security](https://github.com/YOUR_ORG/frontend/workflows/Security%20Scan/badge.svg)
```

---

## 🔧 Lokale Ausführung

Vor einem Commit/Push kannst du lokal prüfen:

```bash
# Alle Checks (wie im CI)
pnpm ci

# Einzeln:
pnpm lint
pnpm typecheck
pnpm test
pnpm tokens:audit
pnpm design:guard
pnpm build
```

---

## 🐛 Troubleshooting

### Workflow schlägt fehl: "pnpm: command not found"

**Lösung:** Der Workflow nutzt `pnpm/action-setup@v4` mit Version `9.15.4`.  
Falls sich die Version ändert, `package.json` aktualisieren:

```json
"packageManager": "pnpm@9.15.4"
```

### Dependency Audit schlägt fehl

**Lösung:** 
```bash
# Lokal prüfen:
pnpm audit

# Automatisch fixen:
pnpm audit --fix
```

### Build schlägt fehl: "Missing environment variables"

**Lösung:** Dummy-Env-Vars in `ci.yml` ergänzen:

```yaml
env:
  NEXT_PUBLIC_BACKEND_URL: http://localhost:4000
  # ... weitere vars
```

---

## 📈 Monitoring

### Workflow Runs anzeigen

```
GitHub > Actions > Workflow Name > Run History
```

### Artefakte herunterladen

```
Workflow Run > Artifacts > Download
```

**Verfügbare Artefakte:**
- `coverage-report` (7 Tage Retention)
- `nextjs-build` (3 Tage Retention)
- `security-audit-report` (30 Tage Retention)

---

## 🔐 Security Best Practices

1. ✅ **Secret Scanning** aktiviert (Gitleaks)
2. ✅ **Dependency Review** für Pull Requests
3. ✅ **Automated Audits** täglich
4. ✅ **License Compliance** (GPL-Blockierung)
5. ⚠️ **TODO:** SARIF Upload zu GitHub Security Tab aktivieren

---

## 📝 Weitere Workflows (Optional)

### Deploy Workflow (Beispiel für Vercel/Netlify)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Performance Testing

```yaml
name: Performance

on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
```

---

## 🆘 Support

Bei Problemen:
1. Workflow Logs prüfen (GitHub Actions Tab)
2. Lokale Reproduktion versuchen (`pnpm ci`)
3. Issue im Repository erstellen

---

**Erstellt:** 2025-12-26  
**Version:** 1.0  
**Autor:** AI Assistant


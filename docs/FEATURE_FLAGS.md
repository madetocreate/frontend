# Feature Flags (Frontend)

## `NEXT_PUBLIC_ENABLE_GASTRO`
- **Default**: `false` (wenn nicht gesetzt)
- **Zweck**: Versteckt Gastro-/„Gastronomie“-UI im normalen AKLOW Frontend.

### Beispiel

```bash
# Gastro UI (nur sichtbar, wenn explizit aktiv)
NEXT_PUBLIC_ENABLE_GASTRO=true npm run dev
```

**Hinweis:** Das ist ausschließlich eine UI-Schicht. Gastro ist serverseitig über `ENABLE_GASTRO` in Node/Python deaktiviert.

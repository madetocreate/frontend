# Development Notes

## Wichtige Hinweise für lokale Entwicklung

### Security im Development-Modus

**Status**: ✅ Deaktiviert für lokale Entwicklung

Die Authentifizierung ist im Development-Modus automatisch deaktiviert, um ohne Backend-Server entwickeln zu können.

📖 **Vollständige Dokumentation**: [SECURITY_DEV_MODE.md](./SECURITY_DEV_MODE.md)

**Wichtig**:
- Security ist **nur** im Development deaktiviert (`NODE_ENV !== 'production'`)
- In Production sind alle Security-Features automatisch aktiv
- Keine Code-Änderungen vor Deployment notwendig

### Schnellstart

```bash
# Lokale Entwicklung starten
npm run dev

# Standard-Tenant
# Alle Requests verwenden automatisch: aklow-main
```

### Environment-Variablen

```bash
# .env.local (für Development)
NODE_ENV=development
NEXT_PUBLIC_DEFAULT_TENANT_ID=aklow-main
```

### Bekannte Änderungen

- ✅ JWT-Verifizierung: Deaktiviert im Dev
- ✅ Tenant-Authentifizierung: Auto-Fallback zu `aklow-main`
- ✅ 401-Fehler: Verhindert im Dev-Modus
- ✅ Memory-API: Funktioniert ohne Auth

---

**Letzte Aktualisierung**: Dezember 2025


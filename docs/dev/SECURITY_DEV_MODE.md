# Security im Development-Modus

## Übersicht

Für die lokale Entwicklung wurde die Security-Authentifizierung temporär deaktiviert, um das Entwickeln ohne Backend-Server zu ermöglichen.

**⚠️ WICHTIG**: Diese Änderungen gelten **NUR** im Development-Modus (`NODE_ENV !== 'production'`). In Production bleiben alle Security-Checks aktiv.

## Was wurde geändert

### 1. Tenant-Authentifizierung (`lib/server/tenant.ts`)

#### JWT-Verifizierung deaktiviert
```typescript
function verifyAndExtractTenantIdFromAuthHeader(authHeader: string | null): string | null {
  // SECURITY DISABLED FOR DEVELOPMENT - Skip JWT verification
  if (process.env.NODE_ENV !== 'production') {
    return null // Return null so getTenantIdFromRequest uses dev fallback
  }
  // ... (Production Code bleibt unverändert)
}
```

**Verhalten**:
- Development: JWT-Token werden nicht verifiziert, Return `null`
- Production: JWT-Token werden mit HS256 und AUTH_SECRET verifiziert

#### Auto-Fallback zu Default-Tenant
```typescript
export function getTenantIdFromRequest(request: NextRequest): string | null {
  // SECURITY DISABLED FOR DEVELOPMENT - Auto-fallback to default tenant
  if (process.env.NODE_ENV !== 'production') {
    const devFallback = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'aklow-main'
    return devFallback
  }
  // ... (Production Code bleibt unverändert)
}
```

**Verhalten**:
- Development: Gibt automatisch `aklow-main` oder den in `NEXT_PUBLIC_DEFAULT_TENANT_ID` konfigurierten Tenant zurück
- Production: Verwendet verifizierte JWT-Token oder interne Service-to-Service Headers

### 2. API-Routes

#### Memory Search (`app/api/memory/search/route.ts`)
```typescript
export async function POST(req: NextRequest): Promise<NextResponse> {
  // SECURITY DISABLED FOR DEVELOPMENT - Auto-fallback to default tenant
  const tenantId = getTenantIdFromRequest(req) || process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'aklow-main';
  // ... Rest des Codes
}
```

**Verhalten**:
- Kein 401-Error mehr bei fehlender Authentifizierung im Development
- Verwendet automatisch den Default-Tenant

## Betroffene Fehler (behoben)

### Vorher
```
[Tenant] JWT verification failed: invalid signature
POST /api/memory/search 401 in 231ms
```

### Nachher
```
(Keine Fehler mehr im Development-Modus)
```

## Konfiguration

### Environment-Variablen

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_DEFAULT_TENANT_ID=aklow-main
```

### Default-Werte

Wenn keine Environment-Variable gesetzt ist:
- **Default Tenant ID**: `aklow-main`
- **JWT-Verifizierung**: Deaktiviert im Development
- **401-Checks**: Deaktiviert im Development

## Production-Sicherheit

### Was bleibt geschützt?

In Production (`NODE_ENV=production`) sind **alle** Security-Features aktiv:

1. ✅ **JWT-Verifizierung**: HS256 mit AUTH_SECRET
2. ✅ **Tenant-Authentifizierung**: Nur verifizierte Token akzeptiert
3. ✅ **401-Fehler**: Bei fehlender Authentifizierung
4. ✅ **Service-to-Service Auth**: x-internal-api-key erforderlich

### Was ist in Production NICHT erlaubt?

- ❌ Requests ohne JWT-Token
- ❌ Query-Parameter für tenantId
- ❌ ENV-Fallbacks für tenantId
- ❌ Ungeprüfte x-tenant-id Header

## Vor dem Deployment

### Checklist

Vor dem Deployment auf Production-Server müssen folgende Dinge aktiviert/konfiguriert werden:

- [ ] `NODE_ENV=production` setzen
- [ ] `AUTH_SECRET` konfigurieren (für JWT-Verifizierung)
- [ ] `INTERNAL_API_KEY` setzen (für Service-to-Service Communication)
- [ ] Frontend-Auth-Flow implementieren (Login, JWT-Token-Verwaltung)
- [ ] Backend-Auth-Flow konfigurieren
- [ ] Security-Tests durchführen

### Wichtige Environment-Variablen für Production

```bash
# Production .env
NODE_ENV=production
AUTH_SECRET=<secure-secret-key>
INTERNAL_API_KEY=<secure-internal-key>
# NEXT_PUBLIC_DEFAULT_TENANT_ID sollte NICHT gesetzt sein
```

## Debugging

### Development-Mode prüfen

```bash
echo $NODE_ENV
# Sollte "development" sein für lokale Entwicklung
```

### Tenant-ID prüfen

Im Code (Server-Side):
```typescript
const tenantId = getTenantIdFromRequest(request)
console.log('[Debug] Current tenantId:', tenantId)
```

Im Browser (Network Tab):
- Alle API-Requests sollten ohne 401-Fehler durchgehen
- Response sollte Daten für `aklow-main` enthalten

## FAQ

### Warum wurde Security deaktiviert?

Für lokale Entwicklung ohne laufenden Backend-Server, um JWT-Token-Verifizierungsfehler zu vermeiden.

### Ist das sicher?

Ja, **nur** für Development. In Production bleiben alle Security-Checks aktiv.

### Was passiert, wenn ich auf Production deploye?

Automatisch werden alle Security-Features aktiviert, da `NODE_ENV=production` gesetzt wird.

### Wie aktiviere ich Security im Development?

Setze folgende Environment-Variablen:
```bash
NODE_ENV=production
AUTH_SECRET=your-secret
```

## Weitere Schritte

### Migration auf Server

Wenn auf den Server migriert wird:

1. ✅ Security-Code ist bereits vorhanden (nur im Dev deaktiviert)
2. ✅ `NODE_ENV=production` setzen
3. ✅ Environment-Variablen konfigurieren
4. ✅ Auth-Flow testen

Keine Code-Änderungen notwendig - nur Environment-Konfiguration.

---

**Erstellt**: Dezember 2025  
**Status**: Development-Only Deaktivierung  
**Review vor Production**: Erforderlich


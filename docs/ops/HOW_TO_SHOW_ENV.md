# Wie zeige ich dir meine .env Dateien?

Da `.env` Dateien normalerweise nicht ins Git committed werden, kann ich sie nicht direkt lesen. Hier sind mehrere Möglichkeiten:

## Option 1: Terminal-Befehle (Empfohlen)

Führe diese Befehle aus und kopiere die Ausgabe:

```bash
# Frontend .env.local
cat /Users/simple-gpt/frontend/.env.local

# Backend .env
cat /Users/simple-gpt/Backend/.env

# Python Backend .env
cat /Users/simple-gpt/Backend/backend-agents/.env
```

## Option 2: In deinem Editor öffnen

1. Öffne die Dateien in deinem Editor:
   - `frontend/.env.local`
   - `Backend/.env`
   - `Backend/backend-agents/.env`

2. Kopiere den Inhalt und füge ihn hier ein

## Option 3: Nur die wichtigen Variablen zeigen

Falls du nicht alles zeigen möchtest, zeige nur diese:

```bash
# Frontend - wichtige Variablen
grep -E "ORCHESTRATOR|MEMORY_API_SECRET|CHATKIT" /Users/simple-gpt/frontend/.env.local

# Backend - wichtige Variablen
grep -E "AUTH_SECRET|AUTH_REQUIRE|MEMORY_API_SECRET|PORT" /Users/simple-gpt/Backend/.env

# Python Backend
cat /Users/simple-gpt/Backend/backend-agents/.env
```

## Option 4: Ich kann die Dateien direkt prüfen

Wenn du mir erlaubst, kann ich versuchen, die Dateien über Terminal-Befehle zu lesen. Sag einfach "ja" und ich mache das.

---

## Aktuelles Problem: Auth-Fehler

Der Fehler "invalid_auth_token" bedeutet, dass der Orchestrator einen signierten Token erwartet, aber entweder:
- Kein Token gesendet wird
- Der Token ungültig ist
- `AUTH_REQUIRE_SIGNED_TOKENS=true` ist, aber der Token nicht mit dem richtigen Secret signiert wurde

### Schnelle Lösung für Development:

Setze in `Backend/.env`:
```env
AUTH_REQUIRE_SIGNED_TOKENS=false
```

Dann den Orchestrator Backend neu starten!

### Oder: Token neu generieren

Falls du einen Token verwenden möchtest:

```bash
cd Backend
# Hole das AUTH_SECRET aus .env
AUTH_SECRET=$(grep AUTH_SECRET .env | cut -d '=' -f2)
node scripts/generate-token.js demo
```

Dann den generierten Token in `frontend/.env.local` als `ORCHESTRATOR_API_TOKEN` eintragen.


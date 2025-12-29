#!/bin/bash
# Frontend Shield Doctor Script
# Prüft Frontend -> Control Plane Verbindung

set -e

CONTROL_PLANE_URL="${CONTROL_PLANE_URL:-http://localhost:4051}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

echo "Frontend Shield Doctor"
echo "====================="
echo ""

# Prüfe ob curl verfügbar ist
if ! command -v curl &> /dev/null; then
  echo "ERROR: curl is required"
  exit 1
fi

# Health Check über Frontend API
echo "1. Checking Frontend Shield API proxy..."
if curl -sf "${FRONTEND_URL}/api/shield/health" > /dev/null 2>&1; then
  echo "   ✓ Frontend Shield API proxy is working"
  HEALTH_RESPONSE=$(curl -sf "${FRONTEND_URL}/api/shield/health" 2>&1)
  echo "   Response: $HEALTH_RESPONSE"
else
  echo "   ✗ Frontend Shield API proxy failed"
  echo "   URL: ${FRONTEND_URL}/api/shield/health"
  echo "   Make sure Next.js dev server is running: npm run dev"
  exit 1
fi

# Direct Control Plane Check
echo ""
echo "2. Checking direct Control Plane connection..."
if curl -sf "${CONTROL_PLANE_URL}/health" > /dev/null 2>&1; then
  echo "   ✓ Control Plane is reachable"
else
  echo "   ⚠ Control Plane not reachable (may be expected if not running)"
  echo "   URL: ${CONTROL_PLANE_URL}/health"
fi

# Settings API Check
echo ""
echo "3. Checking Settings API..."
# Note: This requires auth, so we just check if the endpoint exists
echo "   ℹ Settings API: /api/settings/ai-shield"
echo "   (Requires authentication - test via UI)"

# Registry Endpoint Check (requires admin key)
echo ""
echo "4. Checking Registry endpoint..."
ADMIN_KEY="${CONTROL_PLANE_ADMIN_KEY:-${AI_SHIELD_ADMIN_KEY:-}}"
if [ -z "$ADMIN_KEY" ]; then
  echo "   ⚠ Skipping registry check (CONTROL_PLANE_ADMIN_KEY not set)"
  echo "   To test:"
  echo "   1. Login via /api/admin/login (if available)"
  echo "   2. Call: GET /api/shield/v1/mcp/registry"
else
  if curl -sf -H "x-ai-shield-admin-key: ${ADMIN_KEY}" \
    "${FRONTEND_URL}/api/shield/v1/mcp/registry" > /dev/null 2>&1; then
    echo "   ✓ Registry endpoint accessible via Frontend proxy"
  else
    echo "   ⚠ Registry endpoint not accessible (may need auth cookie)"
  fi
fi

echo ""
echo "✓ Frontend Shield checks completed!"
echo ""
echo "Next steps:"
echo "  - Test Settings UI: ${FRONTEND_URL}/settings?view=shield"
echo "  - Verify Shield Settings persist to Node Backend"


#!/bin/bash
# Smoke Test Script für V2 Frontend
# Führt Static Checks aus (lint, typecheck, build)
# Startet Backend/Frontend nicht dauerhaft

set -e

echo "🔥 V2 Frontend Smoke Test"
echo "=========================="
echo ""

cd "$(dirname "$0")/.."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  node_modules not found, running pnpm install...${NC}"
  pnpm install
else
  echo -e "${GREEN}✅ node_modules present${NC}"
fi
echo ""

# 2. Lint
echo "🔍 Running lint..."
if pnpm lint 2>&1 | tee /tmp/smoke-lint.log; then
  echo -e "${GREEN}✅ Lint passed${NC}"
else
  LINT_EXIT=$?
  ERROR_COUNT=$(grep -c "error" /tmp/smoke-lint.log || echo "0")
  if [ "$ERROR_COUNT" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  Lint has warnings but no errors${NC}"
  else
    echo -e "${RED}❌ Lint failed with $ERROR_COUNT errors${NC}"
    echo "   See /tmp/smoke-lint.log for details"
  fi
fi
echo ""

# 3. TypeCheck
echo "🔍 Running typecheck..."
if pnpm typecheck 2>&1 | tee /tmp/smoke-typecheck.log; then
  echo -e "${GREEN}✅ TypeCheck passed${NC}"
else
  TYPE_EXIT=$?
  ERROR_COUNT=$(grep -c "error TS" /tmp/smoke-typecheck.log || echo "0")
  echo -e "${RED}❌ TypeCheck failed with $ERROR_COUNT errors${NC}"
  echo "   See /tmp/smoke-typecheck.log for details"
  echo ""
  echo "   First 10 errors:"
  grep "error TS" /tmp/smoke-typecheck.log | head -10 | sed 's/^/   /'
fi
echo ""

# 4. Build (non-blocking, informative)
echo "🏗️  Running build..."
if pnpm build 2>&1 | tee /tmp/smoke-build.log; then
  echo -e "${GREEN}✅ Build passed${NC}"
else
  BUILD_EXIT=$?
  echo -e "${RED}❌ Build failed${NC}"
  echo "   See /tmp/smoke-build.log for details"
  echo ""
  echo "   Note: Build may fail due to TypeScript errors."
  echo "   Use 'pnpm build --no-type-check' for deployment (not recommended)"
fi
echo ""

# Summary
echo "=========================="
echo "📊 Smoke Test Summary"
echo "=========================="

if [ "${LINT_EXIT:-0}" -eq "0" ] && [ "${TYPE_EXIT:-0}" -eq "0" ] && [ "${BUILD_EXIT:-0}" -eq "0" ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some checks failed (see above)${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Review errors in /tmp/smoke-*.log"
  echo "  2. Fix P0 blockers first (build-blocking TypeScript errors)"
  echo "  3. See /docs/dev/SMOKE_TEST_REPORT.md for detailed results"
  exit 1
fi


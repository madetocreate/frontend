#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Chat Layout Guard
 * Verhindert Regression: ChatWorkspaceRouter und chat/page.tsx müssen Height-Chain tragen,
 * sonst kollabiert ChatShell (0px height, Messages/Cards verschwinden).
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ROUTER_FILE = path.join(PROJECT_ROOT, 'src', 'features', 'chat', 'ChatWorkspaceRouter.tsx');
const PAGE_FILE = path.join(PROJECT_ROOT, 'src', 'app', '(workspaces)', 'chat', 'page.tsx');

function checkRouterFile() {
  if (!fs.existsSync(ROUTER_FILE)) {
    console.error(`❌ Chat Layout Guard: ${ROUTER_FILE} nicht gefunden.`);
    process.exit(1);
  }

  const content = fs.readFileSync(ROUTER_FILE, 'utf8');

  // Regel 1: KEIN className="ak-fade-in" mehr (ohne h-full/min-h-0)
  const bareAkFadeIn = /className\s*=\s*["']ak-fade-in["']/g;
  const matches = content.match(bareAkFadeIn);
  if (matches && matches.length > 0) {
    console.error('❌ Chat Layout Guard: ChatWorkspaceRouter.tsx enthält noch className="ak-fade-in" ohne h-full/min-h-0.');
    console.error('   Bitte verwende ROUTE_FRAME_CLASS stattdessen.');
    process.exit(1);
  }

  // Regel 2: ROUTE_FRAME_CLASS muss existieren und h-full + min-h-0 enthalten
  const hasRouteFrameClass = content.includes('ROUTE_FRAME_CLASS');
  if (!hasRouteFrameClass) {
    console.error('❌ Chat Layout Guard: ChatWorkspaceRouter.tsx enthält keine ROUTE_FRAME_CLASS Konstante.');
    process.exit(1);
  }

  const routeFrameClassMatch = content.match(/const\s+ROUTE_FRAME_CLASS\s*=\s*["']([^"']+)["']/);
  if (!routeFrameClassMatch) {
    console.error('❌ Chat Layout Guard: ROUTE_FRAME_CLASS konnte nicht geparst werden.');
    process.exit(1);
  }

  const routeFrameClassValue = routeFrameClassMatch[1];
  if (!routeFrameClassValue.includes('h-full')) {
    console.error('❌ Chat Layout Guard: ROUTE_FRAME_CLASS muss "h-full" enthalten.');
    process.exit(1);
  }

  if (!routeFrameClassValue.includes('min-h-0')) {
    console.error('❌ Chat Layout Guard: ROUTE_FRAME_CLASS muss "min-h-0" enthalten.');
    process.exit(1);
  }
}

function checkPageFile() {
  if (!fs.existsSync(PAGE_FILE)) {
    console.error(`❌ Chat Layout Guard: ${PAGE_FILE} nicht gefunden.`);
    process.exit(1);
  }

  const content = fs.readFileSync(PAGE_FILE, 'utf8');

  // Regel: Wrapper muss h-full UND min-h-0 enthalten
  // Suche nach einem Pattern, das h-full und min-h-0 in der Nähe hat (im selben className-String)
  const hasHeightWrapper = /className\s*=\s*["'][^"']*h-full[^"']*min-h-0[^"']*["']/.test(content) ||
                           /className\s*=\s*["'][^"']*min-h-0[^"']*h-full[^"']*["']/.test(content);

  if (!hasHeightWrapper) {
    console.error('❌ Chat Layout Guard: chat/page.tsx braucht einen Wrapper mit h-full UND min-h-0.');
    console.error('   Beispiel: <div className="h-full min-h-0 w-full overflow-hidden">');
    process.exit(1);
  }
}

function main() {
  try {
    checkRouterFile();
    checkPageFile();
    console.log('✅ chat layout guard bestanden');
    process.exit(0);
  } catch (error) {
    console.error('❌ Chat Layout Guard: ChatWorkspaceRouter braucht h-full/min-h-0 Wrapper, sonst kollabiert ChatShell.');
    console.error(error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}


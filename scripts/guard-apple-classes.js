#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Guard Script: Verhindert apple-* Klassen in produktiven Komponenten
 * 
 * Usage: node scripts/guard-apple-classes.js
 * 
 * Prüft:
 * - src/components/chat/** (keine apple-* Klassen)
 * - src/components/ui/navigation/** (keine apple-* Klassen)
 * - src/components/settings/** (keine apple-* Klassen)
 */

const fs = require('fs');
const path = require('path');

const APPLE_CLASS_PATTERN = /\bapple-[a-z-]+\b/g;
const FORBIDDEN_PATHS = [
  'src/components/chat',
  'src/components/ui/navigation',
  'src/components/settings',
];

const ALLOWED_PATHS = [
  'apps/v-app', // Demo-Route
  'src/components/ui/Apple', // Apple-Komponenten selbst (können intern apple-* nutzen, aber nur wenn gescoped)
];

function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      results.push(filePath);
    }
  });

  return results;
}

function isAllowedPath(filePath) {
  return ALLOWED_PATHS.some((allowed) => filePath.includes(allowed));
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(APPLE_CLASS_PATTERN);

  if (matches && matches.length > 0) {
    const uniqueMatches = [...new Set(matches)];
    const lines = content.split('\n');
    const violations = [];

    uniqueMatches.forEach((match) => {
      lines.forEach((line, index) => {
        if (line.includes(match)) {
          violations.push({
            line: index + 1,
            match,
            content: line.trim(),
          });
        }
      });
    });

    return {
      file: filePath,
      violations: violations.slice(0, 5), // Limit to first 5 per file
      count: uniqueMatches.length,
    };
  }

  return null;
}

function main() {
  const projectRoot = path.join(__dirname, '..');
  const violations = [];

  FORBIDDEN_PATHS.forEach((forbiddenPath) => {
    const fullPath = path.join(projectRoot, forbiddenPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  Path not found: ${forbiddenPath}`);
      return;
    }

    const files = findFiles(fullPath);
    files.forEach((file) => {
      if (isAllowedPath(file)) {
        return; // Skip allowed paths
      }

      const result = checkFile(file);
      if (result) {
        violations.push(result);
      }
    });
  });

  if (violations.length === 0) {
    console.log('✅ Keine apple-* Klassen in produktiven Komponenten gefunden!');
    process.exit(0);
  } else {
    console.error(`\n❌ ${violations.length} Datei(en) mit apple-* Klassen in produktiven Komponenten:\n`);
    violations.forEach((violation) => {
      console.error(`📁 ${violation.file}`);
      console.error(`   ${violation.count} unique violation(s):`);
      violation.violations.forEach((v) => {
        console.error(`   Line ${v.line}: ${v.match}`);
        console.error(`   ${v.content.substring(0, 80)}${v.content.length > 80 ? '...' : ''}`);
      });
      console.error('');
    });
    console.error('💡 Tipp: Nutze AKLOW Primitives (ak-bg-glass, ak-card, etc.) oder migriere zu Demo-Routen.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, findFiles };


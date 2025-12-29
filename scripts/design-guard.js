#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Design Guard
 * Verhindert unerlaubte Tailwind-Farbklassen, harte Radius-/Shadow-Utilities und alte Apple-Legacy-Namen.
 * Optional: `node scripts/design-guard.js --staged` für geänderte Dateien, `node ... path1 path2` für gezieltes Scannen.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ALLOWED_FILES = [
  path.join('src', 'app', 'ak-tokens.css'),
  path.join('src', 'app', 'globals.css'),
  path.join('src', 'app', 'ak-utilities.css'),
  path.join('src', 'styles', 'apple-design-tokens.css'),
];
const IGNORED_DIRS = ['node_modules', '.next', '.vercel', '.git', 'dist', 'out', 'tmp', 'docs', 'scripts'];

const PATTERNS = [
  {
    name: 'Tailwind palette colors',
    regex: /\b(?:dark:)?(text|bg|border|ring|stroke|fill)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
  },
  {
    name: 'Hardcoded white/black utilities',
    regex: /\b(?:dark:)?(?:bg|text|border)-(?:white|black)(?!\/)/g, // Erlaubt bg-black/30 für Overlays
  },
  {
    name: 'Hardcoded radius values',
    regex: /rounded-\[(?!var\(--)[^\]]+\]/g,
  },
  {
    name: 'Hardcoded shadow values',
    regex: /shadow-\[(?!var\(--ak-)[^\]]+\]/g, // Erlaubt shadow-[var(--ak-VARNAME)]
  },
  {
    name: 'Apple legacy classes/components',
    regex: /\bapple-(?:glass|blur|backdrop)\b|Apple(Button|Input|Modal|Section|Badge)\b/g,
  },
];

function resolvePath(relative) {
  return path.join(PROJECT_ROOT, relative);
}

function isAllowedFile(filePath) {
  const relative = path.relative(PROJECT_ROOT, filePath);
  return ALLOWED_FILES.some((allowed) => relative === allowed);
}

function shouldSkipDir(dirName) {
  return IGNORED_DIRS.some((ignored) => dirName === ignored);
}

function findFiles(startPath) {
  const results = [];
  const stack = [startPath];

  while (stack.length > 0) {
    const current = stack.pop();
    const stat = fs.statSync(current);

    if (stat.isDirectory()) {
      const dirName = path.basename(current);
      if (shouldSkipDir(dirName)) {
        continue;
      }
      const entries = fs.readdirSync(current);
      entries.forEach((entry) => stack.push(path.join(current, entry)));
    } else if (stat.isFile()) {
      const ext = path.extname(current);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        results.push(current);
      }
    }
  }

  return results;
}

function getStagedFiles() {
  const output = execSync('git diff --name-only --cached', { cwd: PROJECT_ROOT, encoding: 'utf8' });
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((rel) => path.join(PROJECT_ROOT, rel))
    .filter((file) => ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file)));
}

function gatherFiles(args) {
  if (args.length > 0) {
    return args
      .map((arg) => {
        if (path.isAbsolute(arg)) {
          return arg;
        }
        return resolvePath(arg);
      })
      .filter((file) => fs.existsSync(file) && fs.statSync(file).isFile());
  }

  return findFiles(PROJECT_ROOT);
}

function checkFile(filePath) {
  if (isAllowedFile(filePath)) {
    return null;
  }

  const relative = path.relative(PROJECT_ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [];

  PATTERNS.forEach(({ name, regex }) => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        name,
        match: match[0],
        index: match.index,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  });

  if (matches.length === 0) {
    return null;
  }

  return {
    file: relative,
    matches,
  };
}

function main() {
  const args = process.argv.slice(2);
  const staged = args.includes('--staged');
  const explicitFiles = args.filter((arg) => arg !== '--staged');
  let targetFiles = [];

  if (staged) {
    targetFiles = getStagedFiles();
  } else if (explicitFiles.length > 0) {
    targetFiles = gatherFiles(explicitFiles);
  } else {
    targetFiles = gatherFiles([]);
  }

  const violations = [];

  targetFiles.forEach((file) => {
    const violation = checkFile(file);
    if (violation) {
      violations.push(violation);
    }
  });

  if (violations.length === 0) {
    console.log('✅ design guard bestanden');
    process.exit(0);
  }

  console.error('\n⚠️  Design Guard hat Verletzungen gefunden:\n');
  violations.forEach(({ file, matches }) => {
    console.error(`📁 ${file}`);
    matches.slice(0, 6).forEach((entry) => {
      console.error(`   [${entry.name}] Line ${entry.line}: ${entry.match}`);
    });
  });
  console.error('\nBitte nur AK Tokens/Utilities verwenden (keine Tailwind Palette, no hardcoded radius/shadow, kein apple-glass).');
  process.exit(1);
}

if (require.main === module) {
  main();
}


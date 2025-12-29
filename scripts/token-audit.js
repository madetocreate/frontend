#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Token Compliance Audit Script
 * 
 * Scans src/components, src/app/dashboard, and src/app/auth for
 * forbidden Tailwind color classes (gray-*, blue-*, red-*, etc.)
 * 
 * Exit code: 0 if compliant, 1 if violations found
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns for forbidden Tailwind color classes
const FORBIDDEN_PATTERNS = [
  // Text colors
  /\btext-(gray|zinc|slate|neutral|red|green|blue|amber|orange|purple|pink|indigo|violet|yellow|emerald|teal|cyan)-\d+\b/g,
  // Background colors
  /\bbg-(gray|zinc|slate|neutral|red|green|blue|amber|orange|purple|pink|indigo|violet|yellow|emerald|teal|cyan)-\d+\b/g,
  // Border colors
  /\bborder-(gray|zinc|slate|neutral|red|green|blue|amber|orange|purple|pink|indigo|violet|yellow|emerald|teal|cyan)-\d+\b/g,
  // Ring colors (focus states)
  /\bring-(gray|zinc|slate|neutral|red|green|blue|amber|orange|purple|pink|indigo|violet|yellow|emerald|teal|cyan)-\d+\b/g,
  // Focus variants
  /\bfocus:ring-(gray|zinc|slate|neutral|red|green|blue|amber|orange|purple|pink|indigo|violet|yellow|emerald|teal|cyan)-\d+\b/g,
  /\bfocus:border-(gray|zinc|slate|neutral|red|green|blue|amber|orange|purple|pink|indigo|violet|yellow|emerald|teal|cyan)-\d+\b/g,
  // Hover variants
  /\bhover:text-(gray|zinc|slate|neutral|red|green|blue|amber|orange|purple|pink|indigo|violet|yellow|emerald|teal|cyan)-\d+\b/g,
  /\bhover:bg-(gray|zinc|slate|neutral|red|green|blue|amber|orange|purple|pink|indigo|violet|yellow|emerald|teal|cyan)-\d+\b/g,
  /\bhover:border-(gray|zinc|slate|neutral|red|green|blue|amber|orange|purple|pink|indigo|violet|yellow|emerald|teal|cyan)-\d+\b/g,
  // Direct use of Apple tokens instead of AK tokens
  /--apple-[\w-]+/g,
];

// Directories to scan
const SCAN_DIRECTORIES = [
  'src/components',
  'src/app/dashboard',
  'src/app/auth',
];

// File extensions to scan
const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

/**
 * Recursively find all files with matching extensions
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other ignored directories
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        findFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (FILE_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Check a file for forbidden patterns
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];
  
  FORBIDDEN_PATTERNS.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = content.split('\n')[lineNumber - 1];
      violations.push({
        file: filePath,
        line: lineNumber,
        match: match[0],
        context: line.trim(),
      });
    }
  });
  
  return violations;
}

/**
 * Main audit function
 */
function audit() {
  const projectRoot = path.resolve(__dirname, '..');
  process.chdir(projectRoot);
  
  console.log('🔍 Token Compliance Audit\n');
  console.log('Scanning directories:');
  SCAN_DIRECTORIES.forEach(dir => console.log(`  - ${dir}`));
  console.log('');
  
  const allViolations = [];
  
  SCAN_DIRECTORIES.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  Directory not found: ${fullPath}`);
      return;
    }
    
    const files = findFiles(fullPath);
    console.log(`Scanning ${files.length} files in ${dir}...`);
    
    files.forEach(file => {
      const violations = checkFile(file);
      if (violations.length > 0) {
        allViolations.push(...violations);
      }
    });
  });
  
  console.log('');
  
  if (allViolations.length === 0) {
    console.log('✅ All files are compliant! No forbidden Tailwind color classes found.\n');
    process.exit(0);
  } else {
    console.log(`❌ Found ${allViolations.length} violation(s):\n`);
    
    // Group violations by file
    const violationsByFile = {};
    allViolations.forEach(v => {
      const relPath = path.relative(projectRoot, v.file);
      if (!violationsByFile[relPath]) {
        violationsByFile[relPath] = [];
      }
      violationsByFile[relPath].push(v);
    });
    
    // Print violations grouped by file
    Object.keys(violationsByFile).sort().forEach(file => {
      console.log(`\n📄 ${file}`);
      violationsByFile[file].forEach(v => {
        console.log(`   Line ${v.line}: ${v.match}`);
        console.log(`   ${v.context}`);
      });
    });
    
    console.log('\n💡 Replace these with AKLOW token utilities:');
    console.log('   - text-gray-* → ak-text-secondary, ak-text-muted');
    console.log('   - bg-blue-* → ak-bg-surface-*, ak-badge-info');
    console.log('   - border-red-* → ak-border-default, ak-badge-danger');
    console.log('   - focus:ring-blue-* → ak-focus-ring');
    console.log('   - --apple-* → use equivalent --ak-* token (Single Source of Truth)');
    console.log('   - See src/app/ak-utilities.css for all available utilities\n');
    
    process.exit(1);
  }
}

// Run audit
audit();


#!/usr/bin/env tsx
/**
 * Security Audit Script for Next.js API Routes
 * 
 * PURPOSE:
 * Scans all API route handlers for security anti-patterns that could lead to:
 * - Tenant isolation bypass (accepting tenant from client input)
 * - Internal API key misuse (forwarding without auth check)
 * - Hardcoded tenant defaults
 * 
 * USAGE:
 * ```bash
 * pnpm audit:security
 * # or
 * tsx scripts/security-audit-api-routes.ts
 * ```
 * 
 * EXIT CODES:
 * - 0: No security issues found
 * - 1: Security violations detected
 * - 2: Script error
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const API_ROUTES_DIR = path.join(process.cwd(), 'src/app/api')
const ALLOWLIST_FILE = path.join(process.cwd(), 'scripts/security-audit-allowlist.json')

interface Allowlist {
  /** Routes that are allowed to read x-tenant-id from headers (admin routes) */
  allowXTenantIdHeader: string[]
  /** Routes that are allowed to read tenant from query/body (legacy, should be empty) */
  allowClientTenantId: string[]
  /** Routes that are allowed to have hardcoded tenant defaults (should be empty) */
  allowHardcodedDefaults: string[]
}

// Default allowlist (can be overridden by JSON file)
let ALLOWLIST: Allowlist = {
  allowXTenantIdHeader: [
    // Admin routes that explicitly check admin session before using x-tenant-id
    // Example: 'src/app/api/admin/impersonate/route.ts'
  ],
  allowClientTenantId: [],
  allowHardcodedDefaults: [],
}

// Load allowlist from file if exists
if (fs.existsSync(ALLOWLIST_FILE)) {
  try {
    const allowlistData = JSON.parse(fs.readFileSync(ALLOWLIST_FILE, 'utf-8'))
    ALLOWLIST = { ...ALLOWLIST, ...allowlistData }
  } catch (error) {
    console.error(`⚠️  Failed to load allowlist from ${ALLOWLIST_FILE}:`, error)
  }
}

// ══════════════════════════════════════════════════════════════
// SECURITY PATTERNS TO DETECT
// ══════════════════════════════════════════════════════════════

interface SecurityViolation {
  file: string
  line: number
  pattern: string
  code: string
  severity: 'critical' | 'high' | 'medium'
  message: string
}

const SECURITY_PATTERNS = [
  // CRITICAL: Reading tenant from client-controlled sources
  {
    pattern: /request\.headers\.get\(['"]x-tenant-id['"]\)/g,
    severity: 'critical' as const,
    message: 'Reading x-tenant-id from request headers without admin session check',
    allowlist: 'allowXTenantIdHeader',
  },
  {
    pattern: /searchParams\.get\(['"]tenant_?id['"]\)/gi,
    severity: 'critical' as const,
    message: 'Reading tenantId from query parameters (client-controlled)',
    allowlist: 'allowClientTenantId',
  },
  {
    pattern: /body\.tenant_?id/gi,
    severity: 'critical' as const,
    message: 'Reading tenantId from request body (client-controlled)',
    allowlist: 'allowClientTenantId',
  },
  
  // CRITICAL: Hardcoded tenant defaults
  {
    pattern: /\|\|\s*['"]aklow-main['"]/g,
    severity: 'critical' as const,
    message: "Hardcoded tenant default 'aklow-main'",
    allowlist: 'allowHardcodedDefaults',
  },
  {
    pattern: /\|\|\s*['"]demo-tenant['"]/g,
    severity: 'critical' as const,
    message: "Hardcoded tenant default 'demo-tenant'",
    allowlist: 'allowHardcodedDefaults',
  },
  {
    pattern: /\|\|\s*['"]default['"]/g,
    severity: 'high' as const,
    message: "Hardcoded tenant default 'default'",
    allowlist: 'allowHardcodedDefaults',
  },
  {
    pattern: /=\s*['"]aklow-main['"]/g,
    severity: 'critical' as const,
    message: "Direct assignment to 'aklow-main'",
    allowlist: 'allowHardcodedDefaults',
  },
  {
    pattern: /=\s*['"]demo-tenant['"]/g,
    severity: 'critical' as const,
    message: "Direct assignment to 'demo-tenant'",
    allowlist: 'allowHardcodedDefaults',
  },
  
  // HIGH: Using x-internal-api-key without requireUserTenant check
  {
    pattern: /['"]x-internal-api-key['"]\s*:\s*process\.env\.INTERNAL_API_KEY/g,
    severity: 'high' as const,
    message: 'Setting x-internal-api-key - ensure requireUserTenant() is called first',
    allowlist: null, // Will check manually if requireUserTenant is in same file
  },
  
  // CRITICAL: Using deprecated getBackendHeaders (security risk)
  {
    pattern: /import.*getBackendHeaders.*from/g,
    severity: 'critical' as const,
    message: 'Importing deprecated getBackendHeaders - use requireUserTenant + buildServiceToServiceHeaders instead',
    allowlist: null,
  },
  {
    pattern: /getBackendHeaders\s*\(/g,
    severity: 'critical' as const,
    message: 'Using deprecated getBackendHeaders() - use buildServiceToServiceHeaders() with tenantId from requireUserTenant()',
    allowlist: null,
  },
]

// ══════════════════════════════════════════════════════════════
// SCANNER
// ══════════════════════════════════════════════════════════════

function scanFile(filePath: string): SecurityViolation[] {
  const violations: SecurityViolation[] = []
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const relativeFilePath = path.relative(process.cwd(), filePath)
  
  // Check if file uses secure helpers
  const usesRequireUserTenant = content.includes('requireUserTenant')
  const usesBuildServiceHeaders = content.includes('buildServiceToServiceHeaders')
  
  // Special case: _utils.ts is allowed to define getBackendHeaders (it throws an error)
  const isUtilsFile = relativeFilePath.includes('automation-insights/_utils.ts')
  const isDeprecatedDefinition = isUtilsFile && content.includes('throw new Error') && content.includes('getBackendHeaders is deprecated')
  
  for (const { pattern, severity, message, allowlist } of SECURITY_PATTERNS) {
    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.source, pattern.flags)
    
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length
      const lineContent = lines[lineNumber - 1]?.trim() || ''
      
      // Check allowlist
      if (allowlist && ALLOWLIST[allowlist as keyof Allowlist]?.includes(relativeFilePath)) {
        continue // Allowlisted
      }
      
      // Special case: x-internal-api-key is OK if file uses requireUserTenant
      if (message.includes('x-internal-api-key') && usesRequireUserTenant) {
        continue
      }
      
      // Special case: getBackendHeaders definition in _utils.ts is OK if it throws an error
      if (message.includes('getBackendHeaders') && isDeprecatedDefinition) {
        continue // The function throws an error, so it's safe
      }
      
      violations.push({
        file: relativeFilePath,
        line: lineNumber,
        pattern: pattern.source,
        code: lineContent,
        severity,
        message,
      })
    }
  }
  
  return violations
}

async function scanAllRoutes(): Promise<SecurityViolation[]> {
  // Scan all .ts files under src/app/api/** (not just route.ts)
  const allTsFiles = await glob('**/*.ts', { 
    cwd: API_ROUTES_DIR,
    absolute: true,
  })
  
  const allViolations: SecurityViolation[] = []
  
  for (const file of allTsFiles) {
    const violations = scanFile(file)
    allViolations.push(...violations)
  }
  
  return allViolations
}

// ══════════════════════════════════════════════════════════════
// REPORTING
// ══════════════════════════════════════════════════════════════

function printReport(violations: SecurityViolation[]) {
  if (violations.length === 0) {
    console.log('✅ Security audit passed: No violations found')
    return
  }
  
  console.error('\n🔴 SECURITY AUDIT FAILED\n')
  console.error(`Found ${violations.length} security violation(s):\n`)
  
  // Group by severity
  const critical = violations.filter(v => v.severity === 'critical')
  const high = violations.filter(v => v.severity === 'high')
  const medium = violations.filter(v => v.severity === 'medium')
  
  const printViolations = (list: SecurityViolation[], emoji: string, label: string) => {
    if (list.length === 0) return
    
    console.error(`${emoji} ${label} (${list.length}):\n`)
    for (const v of list) {
      console.error(`  ${v.file}:${v.line}`)
      console.error(`    ${v.message}`)
      console.error(`    Code: ${v.code}`)
      console.error('')
    }
  }
  
  printViolations(critical, '🔴', 'CRITICAL')
  printViolations(high, '🟠', 'HIGH')
  printViolations(medium, '🟡', 'MEDIUM')
  
  console.error('─'.repeat(80))
  console.error('\n💡 REMEDIATION:\n')
  console.error('1. Use requireUserTenant(request) to enforce authentication')
  console.error('2. Use buildServiceToServiceHeaders({ tenantId }) for backend calls')
  console.error('3. NEVER accept tenantId from request body/query/headers (except admin routes)')
  console.error('4. NEVER use hardcoded tenant defaults like "aklow-main" or "demo-tenant"')
  console.error('\n📚 See: frontend/src/lib/server/securityGuards.ts\n')
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════

async function main() {
  console.log('🔍 Scanning API routes for security violations...\n')
  console.log(`   Directory: ${API_ROUTES_DIR}`)
  console.log(`   Allowlist: ${ALLOWLIST_FILE}`)
  console.log('')
  
  try {
    const violations = await scanAllRoutes()
    printReport(violations)
    
    if (violations.length > 0) {
      process.exit(1)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Script error:', error)
    process.exit(2)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { scanAllRoutes, scanFile, SECURITY_PATTERNS }


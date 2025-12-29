/**
 * Guardrail Test: Verhindert direkte aklow-action-start Dispatches
 * 
 * FAIL-CLOSED: Alle Action-Dispatches müssen über dispatchActionStart() gehen
 * 
 * Dieser Test verhindert Regressionen, bei denen jemand wieder direkt
 * window.dispatchEvent(new CustomEvent('aklow-action-start'...)) verwendet.
 */

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

describe('No Direct aklow-action-start Dispatch', () => {
  const srcDir = join(process.cwd(), 'src')
  const allowedFiles = [
    'lib/actions/dispatch.ts', // Der Helper selbst
    '__tests__', // Test-Dateien
    '.test.ts', // Test-Dateien
    '.test.tsx', // Test-Dateien
    '.spec.ts', // Test-Dateien
    '.spec.tsx', // Test-Dateien
  ]

  // Pattern für direkte Dispatches (sollten nicht vorkommen)
  const forbiddenPatterns = [
    /new CustomEvent\(['"]aklow-action-start['"]/,
    /dispatchEvent\(new CustomEvent\(['"]aklow-action-start['"]/,
  ]

  function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir)

    files.forEach((file) => {
      const filePath = join(dir, file)
      const stat = statSync(filePath)

      if (stat.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (!file.startsWith('.') && file !== 'node_modules') {
          getAllTsFiles(filePath, fileList)
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        // Skip allowed files
        const relativePath = filePath.replace(process.cwd() + '/', '')
        const isAllowed = allowedFiles.some((allowed) =>
          relativePath.includes(allowed)
        )

        if (!isAllowed) {
          fileList.push(filePath)
        }
      }
    })

    return fileList
  }

  it('should not contain direct aklow-action-start dispatches', () => {
    const tsFiles = getAllTsFiles(srcDir)
    const violations: Array<{ file: string; line: number; content: string }> = []

    tsFiles.forEach((filePath) => {
      try {
        const content = readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')

        lines.forEach((line, index) => {
          forbiddenPatterns.forEach((pattern) => {
            if (pattern.test(line)) {
              violations.push({
                file: filePath.replace(process.cwd() + '/', ''),
                line: index + 1,
                content: line.trim(),
              })
            }
          })
        })
      } catch (error) {
        // Skip files that can't be read
        console.warn(`Could not read file ${filePath}:`, error)
      }
    })

    if (violations.length > 0) {
      const violationMessages = violations.map(
        (v) => `  ${v.file}:${v.line} - ${v.content}`
      )
      expect.fail(
        `Found ${violations.length} direct aklow-action-start dispatch(es). ` +
          `Alle Action-Dispatches müssen über dispatchActionStart() gehen.\n\n` +
          `Violations:\n${violationMessages.join('\n')}\n\n` +
          `Bitte ersetze direkte Dispatches durch:\n` +
          `  import { dispatchActionStart } from '@/lib/actions/dispatch'\n` +
          `  dispatchActionStart(actionId, context, config, source)`
      )
    }

    expect(violations.length).toBe(0)
  })
})


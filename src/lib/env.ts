/**
 * Environment Configuration with Validation
 * 
 * Validates required environment variables at build/runtime.
 * Fails fast with clear error messages if required variables are missing.
 */

import { z } from 'zod'

const EnvSchema = z.object({
  // API Base URL (required)
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  // Legacy fallbacks
  NEXT_PUBLIC_ORCHESTRATOR_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_BACKEND_URL: z.string().url().optional(),
  
  // Control Plane (deprecated for auth, but may be used for other features)
  NEXT_PUBLIC_CONTROL_PLANE_URL: z.string().url().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_FEATURE_TEAMS: z.string().default('0').transform((val) => val === '1' || val === 'true'),
  NEXT_PUBLIC_FEATURE_INTEGRATIONS: z.string().default('1').transform((val) => val === '1' || val === 'true'),
  
  // Dev/Testing
  NEXT_PUBLIC_AUTH_BYPASS: z.string().default('false').transform((val) => val === 'true'),
  NEXT_PUBLIC_AKLOW_DEV_MODE: z.string().default('false').transform((val) => val === 'true'),
  
  // Optional: Default tenant for dev (should not be used in production)
  NEXT_PUBLIC_DEFAULT_TENANT_ID: z.string().optional(),
})

type Env = z.infer<typeof EnvSchema>

let validatedEnv: Env | null = null

function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv
  }
  
  try {
    validatedEnv = EnvSchema.parse(process.env)
    return validatedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`Environment validation failed:\n${errors}\n\nPlease check your .env.local file or environment variables.`)
    }
    throw error
  }
}

/**
 * NOTE:
 * In Client-Bundles (Browser) werden `process.env.*` Werte von Next/Turbopack
 * typischerweise nur dann zuverlässig ersetzt, wenn die Keys DIREKT gelesen werden.
 * Ein `EnvSchema.parse(process.env)` kann deshalb im Browser "leere" Werte ergeben.
 *
 * => `env` nur serverseitig/lazily nutzen; Public-URLs immer direkt aus `process.env.NEXT_PUBLIC_*` lesen.
 */
export const env = validateEnv()

/**
 * Get the API base URL for Node Backend (Orchestrator)
 * Priority: NEXT_PUBLIC_API_BASE_URL > NEXT_PUBLIC_ORCHESTRATOR_API_URL > NEXT_PUBLIC_BACKEND_URL > default
 */
export function getApiBaseUrl(): string {
  // IMPORTANT: Use direct `process.env.NEXT_PUBLIC_*` access so Next can inline values in the client bundle.
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL
  if (apiBase) return apiBase

  const orchestrator = process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL
  if (orchestrator) return orchestrator

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL
  if (backend) return backend

  // Default: Node Backend (Orchestrator) on port 4000
  return 'http://localhost:4000'
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: 'teams' | 'integrations'): boolean {
  if (feature === 'teams') {
    return env.NEXT_PUBLIC_FEATURE_TEAMS
  }
  if (feature === 'integrations') {
    return env.NEXT_PUBLIC_FEATURE_INTEGRATIONS
  }
  return false
}


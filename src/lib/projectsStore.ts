'use client'

import { useSyncExternalStore, useEffect } from 'react'
import { createGatewayClient, type GatewayTransport } from '@/sdk/gateway'
import { getTenantIdWithFallback } from '@/lib/tenant'

import { getApiBaseUrl } from '@/lib/env'

// Gateway Client Setup
const getGatewayBaseUrl = () => {
  return getApiBaseUrl()
}

function getTransport(): GatewayTransport {
  const raw = (process.env.NEXT_PUBLIC_CHAT_TRANSPORT || '').toLowerCase()
  if (raw === 'next_proxy' || raw === 'proxy') return 'next_proxy'
  if (raw === 'direct') return 'direct'
  // Default: same-origin proxy (robust for Dev + Docker/Hybrid)
  if (!process.env.NEXT_PUBLIC_CHAT_TRANSPORT) return 'next_proxy'
  return 'direct'
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('auth_token')
  if (token) return token
  const envToken = process.env.NEXT_PUBLIC_AUTH_TOKEN
  if (envToken && process.env.NODE_ENV !== 'production') {
    return envToken
  }
  return null
}

function createProjectsGatewayClient() {
  const transport = getTransport()
  const baseUrl = transport === 'direct' ? getGatewayBaseUrl() : ''
  return createGatewayClient({
    transport,
    baseUrl,
    getAuthToken: () => getAuthToken(),
    fetchImpl: fetch,
  })
}

export type ProjectFolder = {
  id: string
  name: string
  parentId?: string
  projectId?: string
  color?: string
  createdAt: number
  updatedAt: number
}

export type Project = {
  id: string
  name: string
  color?: string
  description?: string
  instructions?: string
  files?: ProjectFileRef[]
  parentId?: string // For folders within projects
  isFolder?: boolean
  createdAt: number
  updatedAt: number
  threadCount?: number
}

export type ProjectFileRef = {
  documentId: string
  filename: string
  mimeType?: string
  size?: number
  createdAt: number
}

// LocalStorage cache keys
const UPDATE_EVENT = 'aklow-projects-updated'

// In-memory cache
let cachedProjects: Project[] = []
let cacheTimestamp: number = 0
const CACHE_TTL_MS = 5000 // 5 seconds cache
const PROJECT_FILE_LIMIT = 25 // ChatGPT-like default (can be tiered later)

// Get tenant ID
function getTenantId(): string {
  return getTenantIdWithFallback('aklow-main')
}

// Helper to fetch projects from API
// Note: Backend endpoint not yet implemented - projects stored locally for now
async function loadProjectsFromServer(): Promise<Project[]> {
  try {
    // When backend endpoint is ready:
    // const client = createProjectsGatewayClient()
    // const response = await client.listProjects({ tenantId: getTenantId() })
    // return response.projects
    
    // For now, return empty array - projects will be stored locally
    return []
  } catch (error: any) {
    console.warn('Failed to load projects from server:', error?.message || error)
    return []
  }
}

// Read projects (with cache)
function readProjects(): Project[] {
  const now = Date.now()
  if (now - cacheTimestamp < CACHE_TTL_MS && cachedProjects.length > 0) {
    return cachedProjects
  }
  return cachedProjects
}

// Load projects from localStorage as fallback
function loadProjectsFromLocalStorage(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = window.localStorage.getItem('aklow-projects')
    if (!stored) return []
    const projects = JSON.parse(stored) as Project[]
    return Array.isArray(projects) ? projects : []
  } catch {
    return []
  }
}

// Save projects to localStorage
function saveProjectsToLocalStorage(projects: Project[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem('aklow-projects', JSON.stringify(projects))
  } catch {
    // ignore
  }
}

// Refresh projects from server
async function refreshProjects(): Promise<void> {
  const serverProjects = await loadProjectsFromServer()
  if (serverProjects.length > 0) {
    cachedProjects = serverProjects
    cacheTimestamp = Date.now()
    saveProjectsToLocalStorage(serverProjects)
  } else {
    // Fallback to localStorage
    const localProjects = loadProjectsFromLocalStorage()
    cachedProjects = localProjects
    cacheTimestamp = Date.now()
  }
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }
}

// Subscribe to updates
function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  window.addEventListener(UPDATE_EVENT, handler)
  return () => {
    window.removeEventListener(UPDATE_EVENT, handler)
  }
}

const EMPTY_PROJECTS: Project[] = []

export function useProjects() {
  // Initialize from localStorage on first mount
  useEffect(() => {
    // One-time clear as requested by user
    if (typeof window !== 'undefined' && !window.localStorage.getItem('aklow-projects-cleared-dec-26')) {
      window.localStorage.setItem('aklow-projects', '[]');
      window.localStorage.setItem('aklow-projects-cleared-dec-26', 'true');
      cachedProjects = [];
      cacheTimestamp = Date.now();
      window.dispatchEvent(new Event(UPDATE_EVENT));
    }

    if (cachedProjects.length === 0) {
      cachedProjects = loadProjectsFromLocalStorage()
      cacheTimestamp = Date.now()
      window.dispatchEvent(new Event(UPDATE_EVENT));
    }
    refreshProjects().catch(console.error)
  }, [])
  
  const projects = useSyncExternalStore(subscribe, readProjects, () => EMPTY_PROJECTS)
  
  return { projects }
}

// Create project
export async function createProject(name: string, options?: { color?: string; description?: string; parentId?: string; isFolder?: boolean }): Promise<Project> {
  const now = Date.now()
  const id = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? `project-${crypto.randomUUID()}` 
    : `project-${now}-${Math.random().toString(36).slice(2)}`
  
  const project: Project = {
    id,
    name,
    color: options?.color,
    description: options?.description,
    instructions: '',
    files: [],
    parentId: options?.parentId,
    isFolder: options?.isFolder ?? false,
    createdAt: now,
    updatedAt: now,
  }
  
  // Add to cache
  cachedProjects = [project, ...cachedProjects]
  cacheTimestamp = Date.now()
  saveProjectsToLocalStorage(cachedProjects)
  
  // Note: When backend endpoint is ready, sync to server here
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }
  
  return project
}

// Update project
export async function updateProject(projectId: string, patch: Partial<Project>): Promise<void> {
  cachedProjects = cachedProjects.map((p) => 
    p.id === projectId ? { ...p, ...patch, updatedAt: Date.now() } : p
  )
  cacheTimestamp = Date.now()
  saveProjectsToLocalStorage(cachedProjects)
  
  // Note: When backend endpoint is ready, sync to server here
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }
}

// Delete project
export async function deleteProject(projectId: string): Promise<void> {
  cachedProjects = cachedProjects.filter((p) => p.id !== projectId)
  cacheTimestamp = Date.now()
  saveProjectsToLocalStorage(cachedProjects)
  
  // Note: When backend endpoint is ready, sync to server here
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }
}

export async function addProjectFiles(projectId: string, files: ProjectFileRef[]): Promise<void> {
  if (files.length === 0) return
  cachedProjects = cachedProjects.map((p) => {
    if (p.id !== projectId) return p
    const existing = Array.isArray(p.files) ? p.files : []
    const byId = new Map(existing.map((f) => [f.documentId, f]))
    for (const f of files) byId.set(f.documentId, f)
    const merged = Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt)
    const limited = merged.slice(0, PROJECT_FILE_LIMIT)
    return { ...p, files: limited, updatedAt: Date.now() }
  })
  cacheTimestamp = Date.now()
  saveProjectsToLocalStorage(cachedProjects)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }
}

export async function removeProjectFile(projectId: string, documentId: string): Promise<void> {
  cachedProjects = cachedProjects.map((p) => {
    if (p.id !== projectId) return p
    const existing = Array.isArray(p.files) ? p.files : []
    return { ...p, files: existing.filter((f) => f.documentId !== documentId), updatedAt: Date.now() }
  })
  cacheTimestamp = Date.now()
  saveProjectsToLocalStorage(cachedProjects)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }
}

export async function setProjectInstructions(projectId: string, instructions: string): Promise<void> {
  await updateProject(projectId, { instructions })
}

// Build project tree structure
export function buildProjectTree(projects: Project[]): Project[] {
  const projectMap = new Map<string, Project & { children?: Project[] }>()
  const rootProjects: Project[] = []
  
  // Create map of all projects
  projects.forEach(project => {
    projectMap.set(project.id, { ...project, children: [] })
  })
  
  // Build tree structure
  projects.forEach(project => {
    const node = projectMap.get(project.id)!
    if (project.parentId && projectMap.has(project.parentId)) {
      const parent = projectMap.get(project.parentId)!
      if (!parent.children) parent.children = []
      parent.children.push(node)
    } else {
      rootProjects.push(node)
    }
  })
  
  // Flatten tree for display (with indentation)
  const flattened: Project[] = []
  function flatten(nodes: (Project & { children?: Project[] })[], depth = 0) {
    nodes.forEach(node => {
      const { children, ...project } = node
      flattened.push(project)
      if (children && children.length > 0) {
        flatten(children, depth + 1)
      }
    })
  }
  flatten(rootProjects)
  
  return flattened
}

// Get threads count for a project
export function getProjectThreadCount(projectId: string, threads: { projectId?: string }[]): number {
  return threads.filter(t => t.projectId === projectId).length
}


import { z } from 'zod'
import type { ActionOutputType, ActionOutput, ActionSchema } from './types'

const summarySchema = z.object({
  type: z.literal('summary'),
  summary: z.string().trim().min(1).max(1200),
}).passthrough()  // Erlaube Extra-Felder für forward compatibility

const draftSchema = z.object({
  type: z.literal('draft'),
  draft: z.string().trim().min(1).max(2000),
}).passthrough()  // Erlaube Extra-Felder für forward compatibility

const tasksSchema = z.object({
  type: z.literal('tasks'),
  tasks: z.array(z.string().trim().min(1)).min(1).max(8),
}).passthrough()  // Erlaube Extra-Felder für forward compatibility

const planSchema = z.object({
  type: z.literal('plan'),
  title: z.string().trim().optional(),
  steps: z.array(z.string().trim().min(1)).min(1).max(10),
})

const tagsSchema = z.object({
  type: z.literal('tags'),
  tags: z.array(z.string().trim().min(1)).min(1).max(12),
})

const extractionSchema = z.object({
  type: z.literal('extraction'),
  fields: z
    .record(z.string().trim().min(1), z.string().trim().max(500))
    .refine((val) => Object.keys(val).length > 0 && Object.keys(val).length <= 12, 'fields must not be empty'),
  highlights: z.array(z.string().trim()).max(5).optional(),
}).passthrough()  // Erlaube Extra-Felder für forward compatibility

const classificationSchema = z.object({
  type: z.literal('classification'),
  label: z.string().trim().min(1).max(140),
  confidence: z.number().min(0).max(1).optional(),
  details: z.string().trim().max(800).optional(),
}).passthrough()  // Erlaube Extra-Felder für forward compatibility

const replySchema = z.object({
  type: z.literal('reply'),
  reply: z.string().trim().min(1).max(1500),
}).passthrough()  // Erlaube Extra-Felder für forward compatibility

const riskFlagsSchema = z.object({
  type: z.literal('riskFlags'),
  flags: z.array(z.string().trim().min(1)).min(1).max(10),
  severity: z.enum(['low', 'medium', 'high']).optional(),
})

const notificationSchema = z.object({
  type: z.literal('notification'),
  notification: z.string().trim().min(1),
})

const schemaByType: Record<ActionOutputType, ActionSchema> = {
  summary: summarySchema,
  draft: draftSchema,
  tasks: tasksSchema,
  plan: planSchema,
  tags: tagsSchema,
  extraction: extractionSchema,
  classification: classificationSchema,
  reply: replySchema,
  riskFlags: riskFlagsSchema,
  notification: notificationSchema,
}

const normalizeTasks = (tasks: string[]) =>
  tasks
    .map((task) => task.trim())
    .filter(Boolean)
    .slice(0, 8)

const normalizeTags = (tags: string[]) =>
  tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12)

export function validateOutput(outputType: ActionOutputType, raw: unknown): ActionOutput {
  const schema = schemaByType[outputType]
  if (!schema) {
    throw new Error(`Kein Schema für Output-Typ ${outputType} hinterlegt`)
  }

  const hydrated = hydrateDefaults(outputType, raw)
  const parsed = schema.parse(hydrated)

  if (parsed.type === 'tasks') {
    return { ...parsed, tasks: normalizeTasks(parsed.tasks) }
  }

  if (parsed.type === 'tags') {
    return { ...parsed, tags: normalizeTags(parsed.tags) }
  }

  if (parsed.type === 'extraction') {
    const entries = Object.entries(parsed.fields).slice(0, 12)
    return { ...parsed, fields: Object.fromEntries(entries) }
  }

  return parsed
}

function hydrateDefaults(outputType: ActionOutputType, raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw
  const base = raw as Record<string, unknown>
  if (!('type' in base)) {
    return { ...base, type: outputType }
  }
  return raw
}

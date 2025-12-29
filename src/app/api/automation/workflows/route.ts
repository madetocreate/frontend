import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/server/adminSession'
import { requireTenantIdFromRequest } from '@/lib/server/tenant'

const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'
const ADMIN_KEY = process.env.CONTROL_PLANE_ADMIN_KEY || process.env.AI_SHIELD_ADMIN_KEY || ''

export async function GET(request: NextRequest) {
  const gate = requireAdminSession(request)
  if (gate) return gate

  const tenantRes = requireTenantIdFromRequest(request)
  if (tenantRes instanceof NextResponse) return tenantRes
  const tenantId = tenantRes

  try {
    const adminKey = ADMIN_KEY

    const response = await fetch(`${API_BASE_URL}/v1/workflows?tenant_id=${tenantId}`, {
      method: 'GET',
      headers: {
        'x-ai-shield-admin-key': adminKey,
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
    })

    if (!response.ok) {
      return NextResponse.json([])
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Workflows API error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  const gate = requireAdminSession(request)
  if (gate) return gate

  const tenantRes = requireTenantIdFromRequest(request)
  if (tenantRes instanceof NextResponse) return tenantRes
  const tenantId = tenantRes

  try {
    const body = await request.json()
    const { action, workflow_id, inputs } = body

    // Validate required fields
    if (action !== 'trigger') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "trigger"' },
        { status: 400 }
      )
    }

    if (!workflow_id || typeof workflow_id !== 'string') {
      return NextResponse.json(
        { error: 'workflow_id is required and must be a string' },
        { status: 400 }
      )
    }

    // inputs is optional, default to empty object
    const workflowInputs = inputs || {}

    const adminKey = ADMIN_KEY

    // Trigger workflow via unified endpoint
    const response = await fetch(`${API_BASE_URL}/v1/workflows/${workflow_id}/trigger`, {
      method: 'POST',
      headers: {
        'x-ai-shield-admin-key': adminKey,
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({ inputs: workflowInputs }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Failed to trigger workflow')
      return NextResponse.json(
        { error: errorText || 'Failed to trigger workflow' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ ok: true, ...data })
  } catch (error) {
    console.error('Workflows API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


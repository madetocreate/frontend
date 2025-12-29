/**
 * Onboarding Documents Upload API Route
 * 
 * Handles multi-file upload during onboarding and triggers document scan workflow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireTenantIdFromRequest, getInternalApiKeyHeader } from '@/lib/server/tenant'
import { BackendUrls } from '@/app/api/_utils/proxyAuth'

export async function POST(request: NextRequest) {
  try {
    const tenantRes = requireTenantIdFromRequest(request)
    if (tenantRes instanceof NextResponse) return tenantRes
    const tenantId = tenantRes

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files allowed per upload' },
        { status: 400 }
      )
    }

    // Upload each file to backend
    const uploadResults = []
    const uploadErrors = []

    for (const file of files) {
      try {
        const backendFormData = new FormData()
        backendFormData.append('file', file)
        backendFormData.append('tenant_id', tenantId)
        backendFormData.append(
          'metadata',
          JSON.stringify({
            source: 'onboarding',
            category: 'company_knowledge',
            uploaded_at: new Date().toISOString(),
          })
        )
        backendFormData.append('actor', 'onboarding_wizard')

        const response = await fetch(`${BackendUrls.agent()}/documents/upload-batch`, {
          method: 'POST',
          headers: {
            ...getInternalApiKeyHeader(),
            'x-tenant-id': tenantId,
          },
          body: backendFormData,
        })

        if (response.ok) {
          const data = await response.json()
          uploadResults.push({
            filename: file.name,
            size: file.size,
            status: 'uploaded',
            job_id: data.job_id,
            document_id: data.documents?.[0]?.document_id || null,
          })
        } else {
          const errorText = await response.text().catch(() => 'Upload failed')
          uploadErrors.push({
            filename: file.name,
            error: errorText,
          })
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        uploadErrors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Return results
    return NextResponse.json({
      uploaded: uploadResults,
      errors: uploadErrors,
      total: files.length,
      successful: uploadResults.length,
      failed: uploadErrors.length,
    })
  } catch (error) {
    console.error('Error in onboarding upload:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


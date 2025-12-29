/**
 * Widget Configuration API
 * Returns the API URL for the widget to use
 */

import { NextResponse } from 'next/server'

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_AGENT_BACKEND_URL
  
  if (!apiUrl) {
    console.warn('Widget Config: NEXT_PUBLIC_AGENT_BACKEND_URL is not set')
  }

  return NextResponse.json({
    apiUrl: apiUrl || null,
    version: '1.0.0',
  })
}


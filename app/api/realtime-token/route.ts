import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getProjectAccess } from '@/lib/projectAccess'
import { createRealtimeToken } from '@/realtime/token.mjs'

export async function GET(req: NextRequest) {
  const email = (await currentUser())?.primaryEmailAddress?.emailAddress
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 })

  const access = await getProjectAccess(projectId, email)
  if (!access) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  return NextResponse.json({
    token: createRealtimeToken({ projectId, email, access }),
  }, { headers: { 'Cache-Control': 'no-store' } })
}

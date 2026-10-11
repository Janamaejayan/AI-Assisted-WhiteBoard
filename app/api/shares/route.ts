import { db, projectShares, projects } from '@/db'
import { getProjectAccess } from '@/lib/projectAccess'
import { currentUser } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

async function getOwnerEmail() {
  return (await currentUser())?.primaryEmailAddress?.emailAddress ?? null
}

export async function GET(req: NextRequest) {
  const ownerEmail = await getOwnerEmail()
  if (!ownerEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
  if (await getProjectAccess(projectId, ownerEmail) !== 'owner') {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 })
  }

  const shares = await db.select({
    email: projectShares.email,
    permission: projectShares.permission,
  }).from(projectShares).where(eq(projectShares.projectId, projectId))

  return NextResponse.json(shares)
}

export async function POST(req: NextRequest) {
  const ownerEmail = await getOwnerEmail()
  if (!ownerEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, email: rawEmail, permission } = await req.json()
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''
  if (typeof projectId !== 'string' || !projectId ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      (permission !== 'view' && permission !== 'edit')) {
    return NextResponse.json({ error: 'Valid email and permission required' }, { status: 400 })
  }
  if (email === ownerEmail.toLowerCase()) {
    return NextResponse.json({ error: 'You already own this workspace' }, { status: 400 })
  }
  if (await getProjectAccess(projectId, ownerEmail) !== 'owner') {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.SHARE_EMAIL_FROM

  const [project] = await db.select({ name: projects.projectName })
    .from(projects).where(eq(projects.projectId, projectId)).limit(1)
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const link = new URL(`/workspace/${encodeURIComponent(projectId)}`,
    process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).toString()

  await db.insert(projectShares).values({ projectId, email, permission })
    .onConflictDoUpdate({
      target: [projectShares.projectId, projectShares.email],
      set: { permission },
    })

  if (!apiKey || !from) {
    return NextResponse.json({
      success: true,
      emailSent: false,
      link,
      message: 'Access granted. Email delivery is not configured; copy the link to invite them.',
    })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'A WhizBoard workspace was shared with you',
        text: `${ownerEmail} shared "${project.name}" with you (${permission === 'view' ? 'read only' : 'edit'} access).\n\nOpen the workspace: ${link}\n\nSign in with ${email} to use this invitation.`,
      }),
    })
    if (!response.ok) {
      const providerError = await response.json().catch(() => null)
      const detail = typeof providerError?.message === 'string'
        ? providerError.message
        : typeof providerError?.error === 'string'
          ? providerError.error
          : `Resend returned HTTP ${response.status}`
      console.error('Resend rejected invitation email:', response.status, detail)
      return NextResponse.json({
        error: `Access was granted, but the email was not sent. ${detail.slice(0, 400)}`,
        link,
        saved: true,
      }, { status: 502 })
    }
  } catch (error) {
    console.error('Invitation email failed:', error)
    return NextResponse.json({
      error: 'Access was granted, but Resend could not be reached. Copy the link or retry.',
      link,
      saved: true,
    }, { status: 502 })
  }

  return NextResponse.json({ success: true, emailSent: true, link })
}

export async function DELETE(req: NextRequest) {
  const ownerEmail = await getOwnerEmail()
  if (!ownerEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!projectId || !email) return NextResponse.json({ error: 'Project and email required' }, { status: 400 })
  if (await getProjectAccess(projectId, ownerEmail) !== 'owner') {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 })
  }

  await db.delete(projectShares).where(and(
    eq(projectShares.projectId, projectId),
    eq(projectShares.email, email)
  ))
  return NextResponse.json({ success: true })
}

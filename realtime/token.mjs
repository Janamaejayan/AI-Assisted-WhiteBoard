import { createHmac, timingSafeEqual } from 'node:crypto'

function secret() {
  const value = process.env.REALTIME_SECRET || process.env.CLERK_SECRET_KEY
  if (!value) throw new Error('REALTIME_SECRET or CLERK_SECRET_KEY is required')
  return value
}

export function createRealtimeToken({ projectId, email, access }) {
  const payload = Buffer.from(JSON.stringify({
    projectId,
    email: email.toLowerCase(),
    access,
    expiresAt: Date.now() + 5 * 60_000,
  })).toString('base64url')
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyRealtimeToken(token) {
  if (typeof token !== 'string') return null
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return null

  const expected = createHmac('sha256', secret()).update(payload).digest()
  let actual
  try { actual = Buffer.from(signature, 'base64url') } catch { return null }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof data.projectId !== 'string' || typeof data.email !== 'string' ||
        !['owner', 'edit', 'view'].includes(data.access) ||
        typeof data.expiresAt !== 'number' || data.expiresAt < Date.now()) return null
    return data
  } catch {
    return null
  }
}

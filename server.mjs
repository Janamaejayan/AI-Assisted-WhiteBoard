import { createServer } from 'node:http'
import { neon } from '@neondatabase/serverless'
import { WebSocket, WebSocketServer } from 'ws'
import { verifyRealtimeToken } from './realtime/token.mjs'
import { mergeScene } from './realtime/scene.mjs'

const dev = !process.argv.includes('--production') && process.env.NODE_ENV !== 'production'
if (!dev) process.env.NODE_ENV = 'production'
const { default: next } = await import('next')
const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = Number(process.env.PORT || 3000)
const app = next({ dev, hostname, port })
await app.prepare()

const sql = neon(process.env.DATABASE_URL)
const handle = app.getRequestHandler()
const handleNextUpgrade = app.getUpgradeHandler()
const server = createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error('HTTP request failed:', error)
    if (!res.headersSent) res.writeHead(500).end()
  })
})
const websocketServer = new WebSocketServer({ noServer: true, maxPayload: 20 * 1024 * 1024 })
const rooms = new Map()

async function getAccess(projectId, email) {
  const [row] = await sql`
    SELECT p."userEmail" AS owner, s."permission" AS permission
    FROM "projects" p
    LEFT JOIN "project_shares" s
      ON s."project_id" = p."projectId" AND s."email" = ${email}
    WHERE p."projectId" = ${projectId} AND p."is_deleted" = false
    LIMIT 1
  `
  if (!row) return null
  if (row.owner.toLowerCase() === email.toLowerCase()) return 'owner'
  return row.permission || null
}

async function getRoom(projectId) {
  let roomPromise = rooms.get(projectId)
  if (!roomPromise) {
    roomPromise = (async () => {
      const [saved] = await sql`
        SELECT "elements", "files", "appState"
        FROM "whiteBoardData" WHERE "projectId" = ${projectId} LIMIT 1
      `
      return {
        clients: new Set(),
        scene: {
          elements: Array.isArray(saved?.elements) ? saved.elements : [],
          files: saved?.files && typeof saved.files === 'object' ? saved.files : {},
          appState: { viewBackgroundColor: saved?.appState?.viewBackgroundColor || '#ffffff' },
        },
        saving: false,
        dirty: false,
      }
    })()
    rooms.set(projectId, roomPromise)
    roomPromise.catch(() => rooms.delete(projectId))
  }
  return roomPromise
}

async function saveRoom(projectId, room) {
  room.dirty = true
  if (room.saving) return
  room.saving = true

  try {
    while (room.dirty) {
      room.dirty = false
      const scene = room.scene
      await sql`
        INSERT INTO "whiteBoardData" ("projectId", "elements", "files", "appState", "created_at")
        VALUES (${projectId}, ${JSON.stringify(scene.elements)}::jsonb,
                ${JSON.stringify(scene.files)}::jsonb, ${JSON.stringify(scene.appState)}::jsonb, now())
        ON CONFLICT ("projectId") DO UPDATE SET
          "elements" = EXCLUDED."elements",
          "files" = EXCLUDED."files",
          "appState" = COALESCE("whiteBoardData"."appState", '{}'::jsonb) || EXCLUDED."appState",
          "created_at" = now()
      `
    }
  } catch (error) {
    console.error('Could not persist realtime scene:', error)
    room.dirty = true
  } finally {
    room.saving = false
    if (room.dirty) {
      setTimeout(() => saveRoom(projectId, room), 2000)
    } else if (room.clients.size === 0) {
      rooms.delete(projectId)
    }
  }
}

function rejectUpgrade(socket, status) {
  socket.write(`HTTP/1.1 ${status} ${status === 401 ? 'Unauthorized' : 'Forbidden'}\r\n\r\n`)
  socket.destroy()
}

server.on('upgrade', async (req, socket, head) => {
  let url
  try { url = new URL(req.url || '/', 'http://localhost') } catch { return rejectUpgrade(socket, 401) }
  if (url.pathname !== '/api/realtime') {
    handleNextUpgrade(req, socket, head).catch(() => socket.destroy())
    return
  }

  const identity = verifyRealtimeToken(url.searchParams.get('token'))
  if (!identity) return rejectUpgrade(socket, 401)

  try {
    const access = await getAccess(identity.projectId, identity.email)
    if (!access) return rejectUpgrade(socket, 403)
    const room = await getRoom(identity.projectId)
    websocketServer.handleUpgrade(req, socket, head, (ws) => {
      websocketServer.emit('connection', ws, identity, room)
    })
  } catch (error) {
    console.error('WebSocket upgrade failed:', error)
    rejectUpgrade(socket, 403)
  }
})

websocketServer.on('connection', (ws, identity, room) => {
  const { projectId, email } = identity
  ws.identity = identity
  ws.lastSceneAt = 0
  room.clients.add(ws)
  ws.isAlive = true
  ws.on('pong', () => { ws.isAlive = true })
  ws.send(JSON.stringify({ type: 'snapshot', scene: room.scene }))

  ws.on('message', async (raw) => {
    if (raw.length > 20 * 1024 * 1024) return ws.close(1009)
    let message
    try { message = JSON.parse(raw.toString()) } catch { return }
    if (message?.type !== 'scene' || !Array.isArray(message.elements) ||
        !message.files || typeof message.files !== 'object') return
    if (Date.now() - ws.lastSceneAt < 120) return
    ws.lastSceneAt = Date.now()

    try {
      const access = await getAccess(projectId, email)
      if (!access) return ws.close(1008, 'Access revoked')
      if (access === 'view') return

      room.scene = mergeScene(room.scene, message)
      await Promise.all([...room.clients].map(async (client) => {
        if (client.readyState !== WebSocket.OPEN) return
        if (!await getAccess(projectId, client.identity.email)) {
          client.close(1008, 'Access revoked')
          return
        }
        if (client.bufferedAmount > 20 * 1024 * 1024) {
          client.close(1009)
          return
        }
        // Permission checks can finish out of order; always relay the newest scene.
        client.send(JSON.stringify({ type: 'scene', scene: room.scene }))
      }))
      saveRoom(projectId, room)
    } catch (error) {
      console.error('Realtime scene update failed:', error)
    }
  })

  ws.on('close', () => {
    room.clients.delete(ws)
    if (room.clients.size === 0 && !room.saving && !room.dirty) rooms.delete(projectId)
  })
})

const heartbeat = setInterval(() => {
  for (const client of websocketServer.clients) {
    if (!client.isAlive) { client.terminate(); continue }
    client.isAlive = false
    client.ping()
  }
}, 30_000)

server.listen(port, hostname, () => {
  console.log(`WhizBoard listening on http://${hostname}:${port}`)
})

process.on('SIGTERM', () => {
  clearInterval(heartbeat)
  websocketServer.close()
  server.close()
})

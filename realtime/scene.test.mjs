import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeScene } from './scene.mjs'
import { createRealtimeToken, verifyRealtimeToken } from './token.mjs'

test('merges independent edits and keeps deletion tombstones', () => {
  const current = {
    elements: [
      { id: 'a', version: 3, updated: 30, x: 10 },
      { id: 'b', version: 1, updated: 10, isDeleted: false },
    ],
    files: { first: { id: 'first' } },
    appState: { viewBackgroundColor: '#fff' },
  }
  const incoming = {
    elements: [
      { id: 'a', version: 2, updated: 20, x: 0 },
      { id: 'b', version: 2, updated: 20, isDeleted: true },
    ],
    files: { second: { id: 'second' } },
    appState: { viewBackgroundColor: '#eee' },
  }

  const merged = mergeScene(current, incoming)
  assert.equal(merged.elements.find((element) => element.id === 'a').x, 10)
  assert.equal(merged.elements.find((element) => element.id === 'b').isDeleted, true)
  assert.deepEqual(Object.keys(merged.files), ['first', 'second'])
  assert.equal(merged.appState.viewBackgroundColor, '#eee')
})

test('rejects a tampered realtime token', () => {
  process.env.REALTIME_SECRET = 'test-secret'
  const token = createRealtimeToken({ projectId: 'board-1', email: 'User@Example.com', access: 'edit' })
  assert.equal(verifyRealtimeToken(token)?.email, 'user@example.com')
  assert.equal(verifyRealtimeToken(`${token}x`), null)
  delete process.env.REALTIME_SECRET
})

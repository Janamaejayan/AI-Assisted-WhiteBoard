import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { reconcileElements } from '@excalidraw/excalidraw'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'

type Access = 'owner' | 'edit' | 'view' | null
type SceneMessage = {
  type: 'snapshot' | 'scene'
  scene: {
    elements: unknown[]
    files: Record<string, unknown>
    appState?: { viewBackgroundColor?: string }
  }
}

export function useRealtimeWhiteboard(
  api: ExcalidrawImperativeAPI | null,
  projectId: string,
  access: Access
) {
  const socketRef = useRef<WebSocket | null>(null)
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const applyingRemoteRef = useRef(false)
  const [connected, setConnected] = useState(false)

  const sendScene = useCallback(() => {
    const socket = socketRef.current
    if (!api || !socket || socket.readyState !== WebSocket.OPEN || access === 'view') return
    socket.send(JSON.stringify({
      type: 'scene',
      elements: api.getSceneElementsIncludingDeleted(),
      files: api.getFiles(),
      appState: { viewBackgroundColor: api.getAppState().viewBackgroundColor },
    }))
  }, [api, access])

  const queueScene = useCallback(() => {
    if (!connected || applyingRemoteRef.current) return
    if (sendTimerRef.current) clearTimeout(sendTimerRef.current)
    sendTimerRef.current = setTimeout(sendScene, 180)
  }, [connected, sendScene])

  useEffect(() => {
    if (!api || !projectId || !access) return
    let stopped = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let releaseTimer: ReturnType<typeof setTimeout> | null = null

    const connect = async () => {
      try {
        const { data } = await axios.get<{ token: string }>('/api/realtime-token', {
          params: { projectId },
        })
        if (stopped) return

        const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const socket = new WebSocket(
          `${scheme}//${window.location.host}/api/realtime?token=${encodeURIComponent(data.token)}`
        )
        socketRef.current = socket

        socket.onmessage = (event) => {
          if (stopped) return
          let message: SceneMessage
          try { message = JSON.parse(event.data) } catch { return }
          if ((message.type !== 'snapshot' && message.type !== 'scene') ||
              !Array.isArray(message.scene?.elements)) return

          try {
            const local = api.getSceneElementsIncludingDeleted()
            const merged = reconcileElements(
              local as Parameters<typeof reconcileElements>[0],
              message.scene.elements as Parameters<typeof reconcileElements>[1],
              api.getAppState()
            )
            applyingRemoteRef.current = true
            const files = message.scene.files || {}
            api.addFiles(Object.values(files) as Parameters<typeof api.addFiles>[0])
            api.updateScene({
              elements: merged,
              appState: {
                ...api.getAppState(),
                viewBackgroundColor: message.scene.appState?.viewBackgroundColor ||
                  api.getAppState().viewBackgroundColor,
              },
            })
            if (releaseTimer) clearTimeout(releaseTimer)
            releaseTimer = setTimeout(() => { applyingRemoteRef.current = false }, 0)

            setConnected(true)
            if (message.type === 'snapshot' && access !== 'view') {
              // The local canvas may contain edits made while disconnected.
              setTimeout(sendScene, 0)
            }
          } catch (error) {
            console.error('Could not apply realtime scene:', error)
            applyingRemoteRef.current = false
          }
        }

        socket.onclose = () => {
          if (socketRef.current === socket) socketRef.current = null
          if (stopped) return
          setConnected(false)
          retryTimer = setTimeout(connect, 2000)
        }
        socket.onerror = () => socket.close()
      } catch (error) {
        if (stopped) return
        console.error('Realtime connection failed:', error)
        if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) return
        retryTimer = setTimeout(connect, 2000)
      }
    }

    connect()
    return () => {
      stopped = true
      if (retryTimer) clearTimeout(retryTimer)
      if (releaseTimer) clearTimeout(releaseTimer)
      if (sendTimerRef.current) clearTimeout(sendTimerRef.current)
      socketRef.current?.close()
      socketRef.current = null
      setConnected(false)
    }
  }, [api, projectId, access, sendScene])

  return { connected, queueScene, applyingRemoteRef }
}

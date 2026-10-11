'use client'

import Header from '@/components/custom/workspace/Header'
import SmartDoc from '@/components/custom/workspace/SmartDoc'
import WhiteBoard from '@/components/custom/workspace/WhiteBoard'
import {
  exportToBlob,
} from '@excalidraw/excalidraw'

import {ExcalidrawImperativeAPI} from '@excalidraw/excalidraw/types'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const WorkSpace = () => {
  const [activeTab, setActiveTab] = useState('whiteboard')
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null)
  const [projectName, setProjectName] = useState("");
  const [access, setAccess] = useState<'owner' | 'edit' | 'view' | null>(null)
  const [loadError, setLoadError] = useState(false)

  const { projectId } = useParams()

  useEffect(() => {
    if (api && projectId) {
      GetWhiteboardData()
    }
  }, [api, projectId])

  const GetWhiteboardData = async () => {
  if (!api || !projectId) return

  try {
    const result = await axios.get(
      `/api/projects?projectId=${projectId}`
    )
    
    setProjectName(result?.data?.projectName)
    setAccess(result?.data?.access ?? null)
    setLoadError(false)

    const {
      elements = [],
      appState: savedAppState = {},
      files,
    } = result.data

    // Keep Excalidraw's current runtime-only state
    const currentAppState = api.getAppState()

    // Remove collaborators from the saved DB state
    const {
      collaborators,
      ...safeAppState
    } = savedAppState

    api.updateScene({
      elements,

      appState: {
        ...currentAppState,
        ...safeAppState,

        // IMPORTANT:
        // keep the collaborators created by Excalidraw
        collaborators: currentAppState.collaborators,
      },
    })

    if (files) {
      api.addFiles(Object.values(files))
    }

    console.log('Whiteboard loaded successfully')

  } catch (error) {
    setLoadError(true)
    console.error(
      'Failed to load whiteboard data:',
      error
    )
  }
}

  const handleImage = async () => {
    if (!api) return

    try {
      const blob = await exportToBlob({
        elements: api.getSceneElements(),

        appState: {
          ...api.getAppState(),
          exportBackground: true,
        },

        files: api.getFiles(),
        mimeType: 'image/png',
        quality: 1,
      })

      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      const safeName = projectName
        .trim()
        .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
        .replace(/[. ]+$/, '')
      link.download = `${safeName || 'whiteboard'}.png`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export whiteboard:', error)
    }
  }

  if (loadError) {
    return <div className="p-8 text-center">This workspace is unavailable or has not been shared with your signed-in email.</div>
  }

  return (
    <div>
      <Header
        selectedTab={setActiveTab}
        onExport={handleImage}
        projectName = {projectName}
        projectId={String(projectId)}
        access={access}
      />

      {activeTab === 'whiteboard' ? (
        <WhiteBoard
          onApiReady={(api) => setApi(api)}
          access={access}
        />
      ) : (
        <SmartDoc />
      )}
    </div>
  )
}

export default WorkSpace

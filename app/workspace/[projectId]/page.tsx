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
      link.download = 'whiteboard.png'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export whiteboard:', error)
    }
  }

  return (
    <div>
      <Header
        selectedTab={setActiveTab}
        onExport={handleImage}
        projectName = {projectName}
      />

      {activeTab === 'whiteboard' ? (
        <WhiteBoard
          onApiReady={(api) => setApi(api)}
        />
      ) : (
        <SmartDoc />
      )}
    </div>
  )
}

export default WorkSpace
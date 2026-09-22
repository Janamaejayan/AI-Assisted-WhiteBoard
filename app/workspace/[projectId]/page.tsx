'use client'

import Header from '@/components/custom/workspace/Header'
import SmartDoc from '@/components/custom/workspace/SmartDoc';
import WhiteBoard from '@/components/custom/workspace/WhiteBoard';
import { exportToBlob } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import React, { useState } from 'react'

const WorkSpace = () => {

    const [activeTab, setActiveTab] = useState('whiteboard');
    const [api, setApi] = useState <ExcalidrawImperativeAPI | null>(null);

    const handleImage = async () =>{
      if(!api) return;

      const blob = await exportToBlob({
        elements : api.getSceneElements(),
        appState : {
          ...api.getAppState(),
          exportBackground: true
        },
        files : api.getFiles(),
        mimeType : "image/png",
        quality : 1
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'whiteboard.png';
      link.click();

      URL.revokeObjectURL(url);
    }
      return (
    <div>
        <Header selectedTab = {setActiveTab}
          onExport={handleImage}
        />

            {activeTab === 'whiteboard' ? <WhiteBoard onApiReady = {(api: any) =>setApi(api)}/> : <SmartDoc />}
    </div>
  )
}

export default WorkSpace
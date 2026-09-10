'use client'

import Header from '@/components/custom/workspace/Header'
import SmartDoc from '@/components/custom/workspace/SmartDoc';
import WhiteBoard from '@/components/custom/workspace/WhiteBoard';
import React, { useState } from 'react'

const WorkSpace = () => {

    const [activeTab, setActiveTab] = useState('whiteboard');
  return (
    <div>
        <Header selectedTab = {setActiveTab}/>

            {activeTab === 'whiteboard' ? <WhiteBoard /> : <SmartDoc />}
    </div>
  )
}

export default WorkSpace
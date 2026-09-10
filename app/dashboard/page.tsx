import React from 'react'
import { UserButton } from '@clerk/nextjs'
import WelcomeBanner from '@/components/custom/dashboard/WelcomeBanner'
import ProjectList from '@/components/custom/dashboard/ProjectList'

const DashboardPage = () => {
  return (
    <div>
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Project List / Empty state */}
        <ProjectList />
    </div>
  )
}

export default DashboardPage
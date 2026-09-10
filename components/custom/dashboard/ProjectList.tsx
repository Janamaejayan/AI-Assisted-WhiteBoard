'use client'
import { Button } from '@/components/ui/button';
import { Folder } from 'lucide-react';
import React, { useState } from 'react'

const ProjectList = () => {

    const [projectList, useProjectList] = useState([]);
  return (
    <div>
        {projectList.length === 0 ? (
            <div className='flex flex-col items-center p-10 border rounded-xl mt-10 gap-3'>
                <Folder  className='h-15 w-15'/>
                <h2 className='text-xl font-bold'>No Boards Found</h2>
                <p className='text-muted-foreground text-xl'>Create your first board to start Brainstorming, Planning !</p>
                <Button> + Create- New Board</Button>
            </div>

        ): <div> </div>}
    </div>
  )
}

export default ProjectList
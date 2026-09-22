'use client'

import Image from 'next/image'
import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Save, Share, DownloadIcon } from 'lucide-react'

type Props = {
    selectedTab: (value: string) => void;
    onExport : any;
    projectName : string;
}

const Header = ({ selectedTab, onExport, projectName }: Props) => {
    return (
        <div className='p-3 border-b flex justify-between'>

            <div className='flex gap-2 items-center'>
                <Image
                    src='/logo.svg'
                    alt='logo'
                    width={35}
                    height={35}
                />
                <h2>{projectName}</h2>
            </div>

            <div>
                <Tabs
                    defaultValue="whiteboard"
                    
                    onValueChange={(value) => selectedTab(value)}
                >
                    <TabsList>
                        <TabsTrigger value="whiteboard">
                            WhiteBoard
                        </TabsTrigger>

                        <TabsTrigger value="doc">
                            Doc
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className='flex gap-2'>
                <Button> <Save />
                    Save
                </Button>
                < Button variant={'outline'}>
                <Share/> Share</Button>

                <Button onClick={onExport}> <DownloadIcon /> Export </Button>
            </div>

        </div>
    )
}

export default Header
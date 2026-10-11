'use client'

import Image from 'next/image'
import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import {
    Save,
    DownloadIcon
} from 'lucide-react'
import { SidebarTrigger } from "@/components/ui/sidebar"
import ShareBoardDialog from './ShareBoardDialog'

type Props = {
    selectedTab: (value: string) => void;
    onExport: any;
    projectName: string;
    projectId: string;
    access: 'owner' | 'edit' | 'view' | null;
}

const Header = ({
    selectedTab,
    onExport,
    projectName,
    projectId,
    access
}: Props) => {

    return (
        <div className="p-3 border-b flex items-center justify-between">

            {/* LEFT */}
            <div className="flex gap-2 items-center">

                <SidebarTrigger />

                <Image
                    src="/logo.svg"
                    alt="logo"
                    width={35}
                    height={35}
                />

                <h2>{projectName}</h2>
                {access === 'view' && (
                    <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">Read only</span>
                )}

            </div>

            {/* CENTER */}
            <div>
                <Tabs
                    defaultValue="whiteboard"
                    onValueChange={(value) =>
                        selectedTab(value)
                    }
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

            {/* RIGHT */}
            <div className="flex gap-2">

                <Button disabled={access !== 'owner' && access !== 'edit'}>
                    <Save />
                    Save
                </Button>

                {access === 'owner' && <ShareBoardDialog projectId={projectId} />}

                <Button onClick={onExport} disabled={!projectName}>
                    <DownloadIcon />
                    Export
                </Button>

            </div>

        </div>
    )
}

export default Header

"use client"

import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs'
import { Sparkles, Shapes, StickyNote, MousePointer2 } from 'lucide-react';
import React, { useState } from 'react'
import CreateNewBoardDialogue from './CreateNewBoardDialogue';

const WelcomeBanner = () => {

    const { user } = useUser();
    const [aiDialogOpen, setAiDialogOpen] = useState(false);

    return (
        <div>
            <div className='relative overflow-hidden p-10 border rounded-xl bg-gradient-to-br from-background via-background to-violet-50/50 dark:to-violet-950/30'>

                {/* Main Content */}
                <div className='relative z-10 max-w-2xl'>

                    <div className='flex gap-2 items-center'>
                        <Sparkles
                            className='text-violet-500'
                            width={16}
                        />
                        <p className='text-violet-500 font-medium'>
                            Your Creative Workspace
                        </p>
                    </div>

                    <h2 className='text-3xl font-bold mt-2'>
                        Welcome Back,{' '}
                        <span className='bg-gradient-to-r from-violet-600 to-blue-400 bg-clip-text text-transparent'>
                            {user?.firstName}
                        </span>
                    </h2>

                    <p className='text-muted-foreground mt-2'>
                        Turn your ideas into diagrams, notes and visuals
                        on an infinite canvas
                    </p>

                    <div className='mt-5 flex items-center gap-5'>
                        <CreateNewBoardDialogue />

                        <Button
                            variant={"outline"}
                            size={"lg"}
                            onClick={() => setAiDialogOpen(true)}
                        >
                            <Sparkles />
                            AI Helper
                        </Button>
                    </div>

                </div>

                {/* Creative Illustration */}
                <div className='absolute right-8 top-1/2 -translate-y-1/2 w-72 h-44 hidden md:block'>

                    {/* Decorative gradient blobs */}
                    <div className='absolute top-2 right-8 w-28 h-28 bg-violet-500/20 dark:bg-violet-400/15 rounded-full blur-2xl' />
                    <div className='absolute bottom-0 right-24 w-24 h-24 bg-primary/20 rounded-full blur-2xl' />

                    {/* Connecting lines */}
                    <div className='absolute top-20 left-10 w-28 border-t border-dashed border-violet-400/60 dark:border-violet-500/40 rotate-[-12deg]' />
                    <div className='absolute top-28 left-28 w-24 border-t border-dashed border-primary/40 rotate-[18deg]' />

                    {/* Floating card 1 */}
                    <div className='absolute left-4 top-10 w-28 h-20 bg-background rounded-xl border shadow-sm p-3 rotate-[-6deg]'>
                        <div className='flex items-center gap-2'>
                            <div className='p-1.5 rounded-lg bg-violet-500/10 dark:bg-violet-400/15'>
                                <Shapes
                                    size={14}
                                    className='text-violet-500'
                                />
                            </div>
                            <div className='h-2 w-12 bg-muted-foreground/20 rounded' />
                        </div>

                        <div className='mt-3 space-y-1.5'>
                            <div className='h-1.5 w-full bg-muted rounded' />
                            <div className='h-1.5 w-3/4 bg-muted rounded' />
                        </div>
                    </div>

                    {/* Floating note */}
                    <div className='absolute right-5 top-2 w-28 h-24 bg-background rounded-xl border shadow-md p-3 rotate-[7deg]'>
                        <StickyNote
                            size={18}
                            className='text-primary mb-2'
                        />

                        <div className='space-y-2'>
                            <div className='h-2 w-16 bg-primary/15 rounded' />
                            <div className='h-1.5 w-full bg-muted rounded' />
                            <div className='h-1.5 w-4/5 bg-muted rounded' />
                        </div>
                    </div>

                    {/* Center cursor */}
                    <div className='absolute left-32 top-20 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 shadow-lg shadow-violet-400/30 dark:shadow-violet-600/30'>
                        <MousePointer2
                            size={19}
                            className='text-white'
                        />
                    </div>

                    {/* Small floating dots */}
                    <div className='absolute bottom-5 left-20 w-3 h-3 rounded-full bg-violet-400' />
                    <div className='absolute bottom-10 right-20 w-2 h-2 rounded-full bg-primary/60' />
                    <div className='absolute top-28 right-2 w-2 h-2 rounded-full bg-violet-300' />

                </div>

                {/* Subtle background decoration */}
                <div className='absolute -right-20 -top-20 w-64 h-64 rounded-full bg-gradient-to-br from-violet-200/50 to-blue-200/50 dark:from-violet-900/30 dark:to-blue-900/30 blur-3xl' />

            </div>
            <CreateNewBoardDialogue
                open={aiDialogOpen}
                onOpenChange={setAiDialogOpen}
                openAiOnCreate
                hideTrigger
            />
        </div>
    )
}

export default WelcomeBanner

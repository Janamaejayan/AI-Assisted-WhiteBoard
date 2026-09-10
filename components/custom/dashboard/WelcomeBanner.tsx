"use client"
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs'
import { Sparkles } from 'lucide-react';
import React from 'react'

const WelcomeBanner = () => {

    const {user} = useUser();
  return (
    <div>
        <div className='p-10 border rounded-xl bg-linear-to-r from-blue-200 to-purple-200'>
            <h2 className='text-2xl font-bold'>Hello, {user?.firstName}</h2>
            <p>Bring your Ideas to Life on Infinite canvas</p>

            <div className='mt-5 flex items-center gap-5'>
                <Button size={"lg"}>+ Create New Board</Button>
                <Button variant={"outline"} size={"lg"}> < Sparkles /> AI Helper</Button>
            </div>
        </div>
    </div>
  )
}

export default WelcomeBanner
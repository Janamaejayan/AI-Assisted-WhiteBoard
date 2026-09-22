'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LoaderCircle, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const CreateNewBoardDialogue = () => {
    const [workspaceName, setWorkspaceName] = useState('')
    const [loading, setLoading] = useState(false)
    const [dialogue, setDialogue] = useState(false)

    const router = useRouter()

    const handleCreateBoard = async () => {
        if (
            workspaceName.trim() === '' ||
            workspaceName.length > 30
        ) {
            toast.add({
                title: 'Invalid Workspace Name',
                type: 'error',
                description:
                    'Please enter a valid workspace name (1 - 30 characters)',
            })

            return
        }

        try {
            setLoading(true)

            const projectId = crypto.randomUUID()

            const result = await axios.post('/api/projects', {
                projectName: workspaceName.trim(),
                projectId,
            })

            console.log('Created Project:', result.data)

            toast.add({
                type: 'success',
                title: 'New Workspace Created',
            })

            setDialogue(false)

            router.push(`/workspace/${projectId}`)
        } catch (error) {
            console.error('Failed to create workspace:', error)

            toast.add({
                title: 'Failed to Create Workspace',
                type: 'error',
                description:
                    'Something went wrong while creating the workspace.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            open={dialogue}
            onOpenChange={setDialogue}
        >
            {/* Dialog Trigger */}
            <DialogTrigger
                render={
                    <Button className="w-full">
                        <Plus />
                        Create New Board
                    </Button>
                }
            />

            {/* Dialog Content */}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">
                        White Board Workspace Name
                    </DialogTitle>

                    <div>
                        <label className="text-gray-600">
                            Enter WhiteBoard workspace name
                        </label>

                        <Input
                            placeholder="Workspace name"
                            className="mt-1"
                            value={workspaceName}
                            onChange={(e) =>
                                setWorkspaceName(e.target.value)
                            }
                        />
                    </div>
                </DialogHeader>

                <DialogFooter>
                    {/* Cancel */}
                    <DialogClose
                        render={
                            <Button variant="outline">
                                Cancel
                            </Button>
                        }
                    />

                    {/* Create */}
                    <Button
                        disabled={
                            workspaceName.trim().length === 0 ||
                            loading
                        }
                        onClick={handleCreateBoard}
                    >
                        {loading && (
                            <LoaderCircle className="animate-spin" />
                        )}

                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateNewBoardDialogue
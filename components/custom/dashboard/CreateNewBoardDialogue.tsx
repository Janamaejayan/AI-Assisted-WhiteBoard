'use client'

import React, { useEffect, useState } from 'react'
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

type Props = {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    openAiOnCreate?: boolean
    hideTrigger?: boolean
}

const CreateNewBoardDialogue = ({
    open,
    onOpenChange,
    openAiOnCreate = false,
    hideTrigger = false,
}: Props) => {
    const [workspaceName, setWorkspaceName] = useState('')
    const [loading, setLoading] = useState(false)
    const [internalDialogue, setInternalDialogue] = useState(false)
    const dialogue = open ?? internalDialogue
    const setDialogue = onOpenChange ?? setInternalDialogue
    const [summary, setSummary] = useState<{ count: number; total: number | null } | null>(null)
    const atLimit = summary?.total != null && summary.count >= summary.total

    const router = useRouter()

    useEffect(() => {
        if (!dialogue) return

        let active = true
        axios.get<{ count: number; total: number | null }>('/api/projects?summary=true')
            .then(({ data }) => { if (active) setSummary(data) })
            .catch((error) => console.error('Failed to load board limit:', error))

        return () => { active = false }
    }, [dialogue])

    const handleCreateBoard = async () => {
        if (atLimit) return
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

            window.dispatchEvent(new Event('projects:changed'))

            router.push(`/workspace/${projectId}${openAiOnCreate ? '?ai=1' : ''}`)
        } catch (error) {
            console.error('Failed to create workspace:', error)

            if (axios.isAxiosError(error) && error.response?.status === 409) {
                setSummary((current) => current?.total == null ? current : {
                    ...current,
                    count: current.total,
                })
                window.dispatchEvent(new Event('projects:changed'))
                toast.add({
                    title: 'Board limit reached',
                    description: 'Archive a board before creating another one.',
                    type: 'error',
                })
                return
            }

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
            {!hideTrigger && (
                <DialogTrigger
                    render={
                        <Button className="w-full">
                            <Plus />
                            Create New Board
                        </Button>
                    }
                />
            )}

            {/* Dialog Content */}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">
                        {openAiOnCreate
                            ? 'Create a workspace to use AI Helper'
                            : 'White Board Workspace Name'}
                    </DialogTitle>

                    <div>
                        <label className="text-muted-foreground">
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

                    {atLimit && (
                        <p className="text-sm text-destructive">
                            You have reached your {summary.total} board limit. Archive a board to create another.
                        </p>
                    )}
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
                            atLimit ||
                            loading
                        }
                        onClick={handleCreateBoard}
                    >
                        {loading && (
                            <LoaderCircle className="animate-spin" />
                        )}

                        {openAiOnCreate ? 'Create & Open AI' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateNewBoardDialogue

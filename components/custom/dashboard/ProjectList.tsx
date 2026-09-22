'use client'

import {
    ArrowUpRight,
    Delete,
    DeleteIcon,
    Folder,
    MoreHorizontal,
    Trash,
    Trash2,
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import CreateNewBoardDialogue from './CreateNewBoardDialogue'
import axios from 'axios'
import moment from 'moment'
import { toast } from '@/components/ui/toast'

type Project = {
    projectName: string
    previewImage: string
    createdAt: string
    updatedAt: string
    projectId: string
}

const ProjectList = () => {
    const [projectList, setProjectList] = useState<Project[]>([])
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)

    const { isLoaded, isSignedIn, user } = useUser()

    const GetProjectList = async () => {
        try {
            const result = await axios.get('/api/projects')

            console.log('Project List:', result.data)

            setProjectList(result.data)
        } catch (error) {
            console.error(
                'Failed to fetch project list:',
                error
            )
        }
    }

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            GetProjectList()
        }
    }, [isLoaded, isSignedIn])

    const handleDelete = async (
        e: React.MouseEvent<HTMLButtonElement>,
        projectId: string
    ) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setDeletingProjectId(projectId);

            await axios.delete(
                `/api/projects?projectId=${projectId}`
            );

            // Remove it immediately from UI
            setProjectList((prev) =>
                prev.filter(
                    (project) => project.projectId !== projectId
                )
            );

            toast.add({
                title: "Project moved to archive",
                description: "The project has been moved to the archive.",
            });

        } catch (error) {
            console.error(
                "Failed to delete project:",
                error
            );

            toast.add({
                title: "Delete failed",
                description:
                    "Failed to move the project to the archive. Please try again.",
                type: "error",
            });

        } finally {
            setDeletingProjectId(null);
        }
    };
    return (
        <div className="w-full">

            {projectList.length === 0 ? (

                /* ================= EMPTY STATE ================= */

                <div className="mt-8 flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-10 text-center">

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <Folder className="h-7 w-7 text-primary" />
                    </div>

                    <h2 className="text-xl font-semibold">
                        No boards yet
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        Create your first board and start
                        brainstorming, planning, and bringing
                        your ideas to life.
                    </p>

                    <div className="mt-6">
                        <CreateNewBoardDialogue />
                    </div>

                </div>

            ) : (

                /* ================= BOARD SECTION ================= */

                <section className="mt-10">

                    {/* Section Header */}

                    <div className="mb-6 flex items-end justify-between">

                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Your Boards
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Create, organize and continue
                                working on your ideas.
                            </p>
                        </div>

                        <p className="hidden text-sm text-muted-foreground sm:block">
                            {projectList.length}{' '}
                            {projectList.length === 1
                                ? 'board'
                                : 'boards'}
                        </p>

                    </div>

                    {/* Board Grid */}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {projectList.map((project) => (

                            <Link
                                href={`/workspace/${project.projectId}`}
                                key={project.projectId}
                                className="
                                    group
                                    block
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    bg-background
                                    shadow-sm
                                    transition-all
                                    duration-200
                                    hover:-translate-y-1
                                    hover:shadow-md
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-primary
                                    focus:ring-offset-2
                                "
                            >

                                {/* Preview */}

                                <div className="relative aspect-video overflow-hidden bg-muted">

                                    {project.previewImage ? (

                                        <Image
                                            src={project.previewImage}
                                            alt={project.projectName}
                                            fill
                                            className="
                                                object-cover
                                                transition-transform
                                                duration-300
                                                group-hover:scale-105
                                            "
                                        />

                                    ) : (

                                        <div className="flex h-full items-center justify-center">

                                            <div className="
                                                flex
                                                h-12
                                                w-12
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-background
                                                shadow-sm
                                            ">
                                                <Folder className="h-6 w-6 text-muted-foreground" />
                                            </div>

                                        </div>

                                    )}

                                    {/* Hover overlay */}

                                    <div className="
                                        absolute
                                        inset-0
                                        bg-gradient-to-t
                                        from-black/40
                                        via-transparent
                                        to-transparent
                                        opacity-0
                                        transition-opacity
                                        duration-200
                                        group-hover:opacity-100
                                    " />

                                    {/* Open icon */}

                                    <div className="
                                        absolute
                                        bottom-3
                                        right-3
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-white
                                        text-gray-800
                                        opacity-0
                                        shadow-md
                                        transition-all
                                        duration-200
                                        group-hover:opacity-100
                                    ">
                                        <ArrowUpRight size={17} />
                                    </div>

                                </div>

                                {/* Card Details */}

                                <div className="p-4">

                                    <div className="flex items-start justify-between gap-3">

                                        <div className="min-w-0">

                                            <h3 className="truncate text-sm font-semibold">
                                                {project.projectName}
                                            </h3>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Edited{' '}
                                                {moment(
                                                    project.updatedAt
                                                ).fromNow()}
                                            </p>

                                        </div>

                                        {/* Delete button */}

                                        <button
                                            type="button"
                                            disabled={
                                                deletingProjectId ===
                                                project.projectId
                                            }
                                            onClick={(e) =>
                                                handleDelete(
                                                    e,
                                                    project.projectId
                                                )
                                            }
                                            className="
                                                shrink-0
                                                rounded-md
                                                p-1.5
                                                text-muted-foreground
                                                transition-colors
                                                hover:bg-red-50
                                                hover:text-red-600
                                                disabled:pointer-events-none
                                                disabled:opacity-50
                                            "
                                            aria-label={`Delete ${project.projectName}`}
                                        >
                                            {deletingProjectId ===
                                            project.projectId ? (
                                                <Trash2
                                                    size={17}
                                                    className="animate-pulse"
                                                />
                                            ) : (
                                                <Trash
                                                    size={18}
                                                />
                                            )}
                                        </button>

                                    </div>

                                </div>

                            </Link>

                        ))}

                    </div>

                </section>

            )}

        </div>
    )
}

export default ProjectList
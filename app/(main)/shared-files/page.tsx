'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import moment from 'moment'
import { AlertCircle, ArrowUpRight, Eye, FolderOpen, LoaderCircle, Pencil, RefreshCw, Search, UsersRound } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type SharedProject = {
  projectId: string
  projectName: string
  ownerEmail: string
  permission: 'view' | 'edit'
  previewImage: string | null
  updatedAt: string | null
}

export default function SharedFilesPage() {
  const [projects, setProjects] = useState<SharedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'view' | 'edit'>('all')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const { data } = await axios.get<SharedProject[]>('/api/projects?shared=true')
      setProjects(data)
    } catch (cause) {
      console.error('Failed to load shared workspaces:', cause)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadProjects() }, [loadProjects])

  const visibleProjects = useMemo(() => projects.filter((project) => {
    const search = query.trim().toLowerCase()
    return (filter === 'all' || project.permission === filter) && (!search ||
      project.projectName.toLowerCase().includes(search) ||
      project.ownerEmail.toLowerCase().includes(search))
  }), [projects, query, filter])

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-7">
          <div className="flex items-start gap-4">
            <SidebarTrigger className="mt-1" />
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary"><UsersRound size={21} /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Collaboration</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Shared with me</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Workspaces others have invited you to view or edit.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadProjects} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </header>

        {!error && !loading && projects.length > 0 && (
          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Workspaces</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{projects.length} {projects.length === 1 ? 'workspace' : 'workspaces'} shared with you</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="relative sm:w-64">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input aria-label="Search shared workspaces" placeholder="Search workspaces" value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" />
              </div>
              <select aria-label="Filter by permission" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="all">All access</option>
                <option value="edit">Can edit</option>
                <option value="view">Read only</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-80 items-center justify-center text-muted-foreground" role="status"><LoaderCircle className="mr-2 animate-spin" size={20} /> Loading shared workspaces...</div>
        ) : error ? (
          <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-8 text-center">
            <AlertCircle className="mb-3 text-destructive" size={28} />
            <h2 className="font-semibold">Couldn’t load shared workspaces</h2>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            <Button variant="outline" className="mt-5" onClick={loadProjects}>Try again</Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FolderOpen size={26} /></div>
            <h2 className="text-lg font-semibold">Nothing shared with you yet</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">Ask a workspace owner to invite your signed-in email. Their workspace will appear here once you have access.</p>
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed bg-card p-12 text-center">
            <h2 className="font-semibold">No matching workspaces</h2>
            <p className="mt-1 text-sm text-muted-foreground">Try another search or access filter.</p>
            <Button variant="ghost" className="mt-3" onClick={() => { setQuery(''); setFilter('all') }}>Clear filters</Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((project) => (
              <Link key={project.projectId} href={`/workspace/${project.projectId}`} className="group overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="relative aspect-video overflow-hidden border-b bg-muted/60">
                  {project.previewImage ? (
                    <Image src={project.previewImage} alt={`Preview of ${project.projectName}`} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-card text-muted-foreground shadow-sm"><FolderOpen size={27} /></div></div>
                  )}
                  <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border bg-background/95 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur ${project.permission === 'edit' ? 'border-primary/20 text-primary' : 'border-border text-foreground'}`}>
                    {project.permission === 'edit' ? <Pencil size={12} /> : <Eye size={12} />}
                    {project.permission === 'edit' ? 'Can edit' : 'Read only'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold" title={project.projectName}>{project.projectName}</h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground" title={project.ownerEmail}>Shared by {project.ownerEmail}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{project.updatedAt ? `Updated ${moment(project.updatedAt).fromNow()}` : 'Ready to open'}</p>
                  </div>
                  <ArrowUpRight size={18} className="mt-0.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

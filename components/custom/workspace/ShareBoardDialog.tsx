'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Copy, Share, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'

type ShareEntry = { email: string; permission: 'view' | 'edit' }

export default function ShareBoardDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'view' | 'edit'>('view')
  const [shares, setShares] = useState<ShareEntry[]>([])
  const [busy, setBusy] = useState(false)
  const [link, setLink] = useState('')

  useEffect(() => {
    setLink(`${window.location.origin}/workspace/${projectId}`)
  }, [projectId])

  const loadShares = async () => {
    const { data } = await axios.get<ShareEntry[]>('/api/shares', { params: { projectId } })
    setShares(data)
  }

  useEffect(() => {
    if (open) loadShares().catch((error) => console.error('Failed to load shares:', error))
  }, [open, projectId])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      toast.add({ title: 'Link copied', description: 'Only invited email addresses can open it.' })
    } catch {
      toast.add({ title: 'Could not copy link', type: 'error' })
    }
  }

  const invite = async () => {
    if (!email.trim()) return
    setBusy(true)
    try {
      const { data } = await axios.post('/api/shares', { projectId, email, permission })
      loadShares().catch((error) => console.error('Failed to refresh shares:', error))
      setEmail('')
      toast.add({
        title: data.emailSent ? 'Invitation sent' : 'Access granted',
        description: data.emailSent
          ? `${email} can open the workspace with ${permission} access.`
          : data.message,
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.saved) {
        loadShares().catch((loadError) => console.error('Failed to refresh shares:', loadError))
      }
      toast.add({
        title: axios.isAxiosError(error) && error.response?.data?.saved
          ? 'Access granted, email not sent'
          : 'Could not share workspace',
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || 'Please try again.'
          : 'Please try again.',
        type: 'error',
      })
    } finally {
      setBusy(false)
    }
  }

  const revoke = async (recipient: string) => {
    try {
      await axios.delete('/api/shares', { params: { projectId, email: recipient } })
      setShares((current) => current.filter((share) => share.email !== recipient))
      toast.add({ title: 'Access removed' })
    } catch {
      toast.add({ title: 'Could not remove access', type: 'error' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline"><Share />Share</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Share workspace</DialogTitle></DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="share-email" className="text-sm font-medium">Recipient email</label>
            <Input id="share-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
          </div>

          <div className="space-y-2">
            <label htmlFor="share-permission" className="text-sm font-medium">Access</label>
            <select id="share-permission" value={permission} onChange={(event) => setPermission(event.target.value as 'view' | 'edit')}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="view">Read only</option>
              <option value="edit">Can edit</option>
            </select>
          </div>

          <Button onClick={invite} disabled={busy || !email.trim()} className="w-full">
            {busy ? 'Sharing…' : 'Send invitation'}
          </Button>

          <div className="flex gap-2">
            <Input value={link} readOnly aria-label="Workspace link" />
            <Button type="button" variant="outline" onClick={copyLink} aria-label="Copy workspace link"><Copy /></Button>
          </div>
          <p className="text-xs text-muted-foreground">The link works only for invited recipients signed in with the matching email.</p>

          {shares.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <h3 className="text-sm font-medium">People with access</h3>
              {shares.map((share) => (
                <div key={share.email} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{share.email} · {share.permission === 'view' ? 'Read only' : 'Can edit'}</span>
                  <Button type="button" size="icon" variant="ghost" onClick={() => revoke(share.email)} aria-label={`Remove ${share.email}`}><Trash2 /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

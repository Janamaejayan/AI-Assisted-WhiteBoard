"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { ArrowUpRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import CreateNewBoardDialogue from "./CreateNewBoardDialogue"

export default function WelcomeBanner() {
  const { user } = useUser()
  const [aiDialogOpen, setAiDialogOpen] = useState(false)

  return (
    <>
      <section className="grid gap-8 border-b border-border pb-9 pt-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your workspace</p>
          <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Good to see you{user?.firstName ? `, ${user.firstName}` : ""}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Pick up where you left off, or start a new board for what comes next.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CreateNewBoardDialogue />
          <Button variant="outline" size="lg" onClick={() => setAiDialogOpen(true)} className="gap-2">
            <Sparkles size={16} /> Create with AI <ArrowUpRight size={15} />
          </Button>
        </div>
      </section>
      <CreateNewBoardDialogue open={aiDialogOpen} onOpenChange={setAiDialogOpen} openAiOnCreate hideTrigger />
    </>
  )
}

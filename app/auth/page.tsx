"use client"

import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Check, PenLine, Users } from "lucide-react"
import AuthForm from "@/components/auth/AuthForm"

export default function AuthPage() {
  return <Suspense fallback={null}><AuthPageContent /></Suspense>
}

function AuthPageContent() {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin"

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5"><Image src="/logo.svg" alt="" width={32} height={32} /><span className="text-[17px] font-semibold tracking-tight">WhizBoard</span></Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft size={15} /> Back to home</Link>
        </div>
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl gap-14 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_470px] lg:items-center lg:gap-24 lg:py-20">
        <section className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Welcome to WhizBoard</p>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.055em]">A clearer way to work through ideas.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">Give your team a shared place to sketch, connect, and develop what matters.</p>
          <div className="mt-12 max-w-lg border-t border-border">
            <div className="flex items-center gap-4 border-b border-border py-5"><PenLine size={19} className="text-primary" /><span className="text-sm font-medium">Map ideas on an open canvas</span><Check size={15} className="ml-auto text-muted-foreground" /></div>
            <div className="flex items-center gap-4 border-b border-border py-5"><Users size={19} className="text-primary" /><span className="text-sm font-medium">Collaborate in one workspace</span><Check size={15} className="ml-auto text-muted-foreground" /></div>
          </div>
        </section>
        <section className="flex justify-center lg:justify-end"><AuthForm initialMode={initialMode} /></section>
      </div>
    </main>
  )
}

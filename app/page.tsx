import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  FileText,
  Layers3,
  MousePointer2,
  PenLine,
  Sparkles,
  Users,
} from "lucide-react"

const features = [
  {
    number: "01",
    icon: PenLine,
    title: "Think on an open canvas",
    description: "Sketch flows, map ideas, and connect the pieces without running out of room.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Move faster with AI",
    description: "Turn a prompt into a useful starting point, then make the work your own.",
  },
  {
    number: "03",
    icon: Users,
    title: "Work together naturally",
    description: "Keep the conversation and the work in the same shared space.",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="WhizBoard home">
            <Image src="/logo.svg" alt="" width={32} height={32} />
            <span className="text-[17px] font-semibold tracking-tight">WhizBoard</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            <a className="transition-colors hover:text-foreground" href="#features">Features</a>
            <a className="transition-colors hover:text-foreground" href="#workflow">How it works</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth?mode=signin" className="px-2 py-2 text-sm font-medium hover:text-primary">Log in</Link>
            <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Get started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-20 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-28">
          <div>
            <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <span className="h-px w-7 bg-primary" />
              A better way to think together
            </div>
            <h1 className="max-w-[650px] text-[clamp(3.2rem,5.5vw,5.5rem)] font-semibold leading-[1.04] tracking-[-0.065em]">
              Give your ideas room to grow.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              A focused whiteboard for mapping ideas, building diagrams, and working through complex problems with your team.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/auth?mode=signup" className="inline-flex items-center gap-3 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Start a board <ArrowRight size={16} />
              </Link>
              <a href="#workflow" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
                See how it works
              </a>
            </div>
            <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
              <Check size={16} className="text-primary" /> One place for sketches, diagrams, and notes.
            </p>
          </div>

          <div className="relative" aria-label="Illustration of a WhizBoard workspace">
            <div className="absolute -inset-4 -z-10 rounded-[22px] bg-secondary" />
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_18px_55px_-30px_rgba(23,34,44,.3)]">
              <div className="flex h-13 items-center justify-between border-b border-border px-5">
                <div className="flex items-center gap-3">
                  <span className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-border" /><i className="h-2 w-2 rounded-full bg-border" /><i className="h-2 w-2 rounded-full bg-border" /></span>
                  <span className="ml-2 text-xs font-medium text-muted-foreground">Product planning / Q4 roadmap</span>
                </div>
                <span className="hidden rounded border border-border px-2 py-1 text-[11px] text-muted-foreground sm:block">Shared workspace</span>
              </div>
              <div className="relative min-h-[390px] bg-[radial-gradient(var(--canvas-dot)_0.8px,transparent_0.8px)] bg-[length:20px_20px] p-6 sm:min-h-[460px] sm:p-9">
                <div className="absolute right-5 top-5 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm">
                  <span className="flex -space-x-2"><span className="h-6 w-6 rounded-full border-2 border-card bg-[#bba996]" /><span className="h-6 w-6 rounded-full border-2 border-card bg-[#6b847f]" /><span className="h-6 w-6 rounded-full border-2 border-card bg-[#c99e84]" /></span>
                  3 collaborators
                </div>
                <p className="mb-6 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">From idea to action</p>
                <div className="relative grid gap-5 pt-10 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-accent text-primary"><Layers3 size={18} /></div>
                    <p className="text-sm font-semibold">Explore the problem</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">Collect context, questions, and early ideas.</p>
                    <div className="mt-5 flex gap-1"><span className="h-1.5 w-16 rounded bg-primary/30" /><span className="h-1.5 w-8 rounded bg-primary/15" /></div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:mt-16">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-[#eee8df] text-[#80664e] dark:bg-[#3a332c] dark:text-[#d6b79a]"><FileText size={18} /></div>
                    <p className="text-sm font-semibold">Shape a direction</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">Connect the dots and make the next step clear.</p>
                    <div className="mt-5 flex gap-1"><span className="h-1.5 w-12 rounded bg-[#b8a58d]" /><span className="h-1.5 w-12 rounded bg-[#b8a58d]/30" /></div>
                  </div>
                </div>
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-md">
                  <MousePointer2 size={17} className="text-primary" /><span className="h-5 w-px bg-border" /><PenLine size={17} className="text-muted-foreground" /><span className="h-5 w-px bg-border" /><Layers3 size={17} className="text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Made for the way ideas happen</p>
            <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">Everything you need to find clarity.</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-muted-foreground lg:justify-self-end">Move from a loose thought to a shared plan in a workspace that stays out of your way.</p>
        </div>
        <div className="grid gap-0 md:grid-cols-3">
          {features.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="border-b border-border py-9 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <div className="mb-10 flex items-center justify-between"><Icon size={22} strokeWidth={1.6} className="text-primary" /><span className="text-xs tabular-nums text-muted-foreground">{number} / 03</span></div>
              <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="border-y border-border bg-secondary/65">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">A simple workflow</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Start with a thought. Build from there.</h2>
            <p className="mt-6 max-w-md leading-7 text-muted-foreground">WhizBoard gives your team a common place to explore, refine, and share what comes next.</p>
          </div>
          <div className="border-t border-border">
            {[
              ["01", "Create a board", "Open a fresh canvas for a project, meeting, or new idea."],
              ["02", "Make it visual", "Add notes, draw connections, or ask AI to draft a diagram."],
              ["03", "Bring people in", "Share the board and keep moving together."],
            ].map(([number, title, description]) => (
              <div key={number} className="grid grid-cols-[48px_1fr] gap-4 border-b border-border py-6 sm:grid-cols-[70px_1fr]">
                <span className="pt-1 text-sm tabular-nums text-primary">{number}</span>
                <div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-28">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Ready when you are</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">Make space for your next big idea.</h2>
        </div>
        <Link href="/auth?mode=signup" className="inline-flex shrink-0 items-center gap-3 rounded-md bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Get started <ArrowRight size={16} /></Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2 text-foreground"><Image src="/logo.svg" alt="" width={25} height={25} /><span className="font-semibold">WhizBoard</span></div>
          <span>Ideas are better when they have room to grow.</span>
        </div>
      </footer>
    </main>
  )
}

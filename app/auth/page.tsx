"use client"

import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react"

import AuthForm from "@/components/auth/AuthForm"

export default function AuthPage() {
  return <Suspense fallback={null}><AuthPageContent /></Suspense>
}

function AuthPageContent() {
  const searchParams = useSearchParams()

  const initialMode =
    searchParams.get("mode") === "signup"
      ? "signup"
      : "signin"

  return (
    <main className="
      min-h-screen
      overflow-hidden
      bg-gradient-to-br
      from-indigo-50 dark:from-indigo-400/10
      via-white dark:via-background
      to-violet-50 dark:to-violet-400/10
    ">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="
        flex
        h-[72px]
        items-center
        border-b
        border-border/80
        bg-background/80
        px-6
        backdrop-blur-xl
      ">

        <Link
          href="/"
          className="flex items-center gap-2.5"
        >

          <Image
            src="/logo.svg"
            alt="WhizBoard"
            width={36}
            height={36}
          />

          <span className="text-xl font-bold tracking-tight">
            WhizBoard
          </span>

        </Link>


        <div className="ml-auto text-sm text-muted-foreground">

          <span className="hidden sm:inline">
            Ready to visualize your ideas?
          </span>

          <Link
            href="/"
            className="
              ml-2
              font-semibold
              text-indigo-600 dark:text-indigo-300
              hover:text-indigo-700 dark:hover:text-indigo-200
            "
          >
            Back to home
          </Link>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="
        relative
        mx-auto
        grid
        min-h-[calc(100vh-72px)]
        max-w-7xl
        items-center
        gap-12
        px-6
        py-12
        lg:grid-cols-[1fr_470px]
        lg:gap-20
        lg:py-16
      ">

        {/* Background decoration */}

        <div className="
          pointer-events-none
          absolute
          -left-40
          top-20
          h-96
          w-96
          rounded-full
          bg-primary/20
          blur-3xl
        " />

        <div className="
          pointer-events-none
          absolute
          right-0
          top-10
          h-[450px]
          w-[450px]
          rounded-full
          bg-violet-300/20
          blur-3xl
        " />


        {/* =================================================
            LEFT INFORMATION
        ================================================= */}

        <section className="relative hidden lg:block">

          <div className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-indigo-200 dark:border-indigo-400/20
            bg-indigo-50 dark:bg-indigo-400/10
            px-4
            py-2
            text-xs
            font-semibold
            text-indigo-700 dark:text-indigo-200
          ">
            <Sparkles size={14} />
            Your intelligent visual workspace
          </div>


          <h1 className="
            mt-7
            text-5xl
            font-bold
            leading-[1.05]
            tracking-[-0.04em]
            text-foreground
          ">
            Create.
            <br />

            <span className="
              bg-gradient-to-r
              from-indigo-600
              to-violet-600
              bg-clip-text
              text-transparent
            ">
              Visualize.
            </span>

            <br />

            Collaborate.
          </h1>


          <p className="
            mt-6
            max-w-lg
            text-base
            leading-7
            text-foreground
          ">
            Bring your ideas to life with a collaborative
            whiteboard designed to work alongside you and
            your AI assistant.
          </p>


          <div className="mt-10 space-y-5">

            <AuthBenefit
              icon={<Sparkles size={17} />}
              iconClass="bg-violet-500/10 dark:bg-violet-400/15 text-violet-600 dark:text-violet-300"
              title="AI-assisted diagrams"
              description="Generate flowcharts, architectures and workflows from natural language."
            />

            <AuthBenefit
              icon={<Users size={17} />}
              iconClass="bg-primary/15 text-primary"
              title="Collaborative workspace"
              description="Keep your team and projects connected in one visual workspace."
            />

            <AuthBenefit
              icon={<Workflow size={17} />}
              iconClass="bg-cyan-100 text-cyan-600"
              title="Infinite canvas"
              description="Sketch and organize ideas without being restricted by page boundaries."
            />

          </div>


          {/* Small visual */}

          <div className="
            relative
            mt-12
            h-36
            max-w-md
            overflow-hidden
            rounded-2xl
            border
            border-indigo-100 dark:border-border
            bg-background/80
            p-4
            shadow-xl
            shadow-indigo-100/40
          ">

            <div className="
              absolute
              inset-0
              opacity-50
            "
              style={{
                backgroundImage:
                  "radial-gradient(#c7d2fe 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            <div className="
              absolute
              left-8
              top-10
              rounded-lg
              border
              border-primary/25
              bg-primary/10
              px-4
              py-2
              text-xs
              font-semibold
              text-primary
            ">
              Idea
            </div>

            <div className="
              absolute
              left-[42%]
              top-16
              h-px
              w-20
              bg-indigo-300"
            />

            <div className="
              absolute
              right-8
              top-10
              rounded-lg
              border
              border-violet-200 dark:border-violet-400/20
              bg-violet-50 dark:bg-violet-400/10
              px-4
              py-2
              text-xs
              font-semibold
              text-violet-700 dark:text-violet-200
            ">
              Diagram
            </div>

            <div className="
              absolute
              left-[46%]
              top-4
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-indigo-500
              to-violet-500
              text-white
              shadow-lg
            ">
              <Sparkles size={14} />
            </div>

          </div>

        </section>


        {/* =================================================
            AUTH FORM
        ================================================= */}

        <section className="relative flex justify-center lg:justify-end">

          <AuthForm initialMode={initialMode} />

        </section>

      </div>

    </main>
  )
}


function AuthBenefit({
  icon,
  iconClass,
  title,
  description,
}: {
  icon: React.ReactNode
  iconClass: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">

      <div className={`
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-xl
        ${iconClass}
      `}>
        {icon}
      </div>

      <div>

        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <p className="
          mt-1
          max-w-md
          text-sm
          leading-6
          text-muted-foreground
        ">
          {description}
        </p>

      </div>

    </div>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Layers3,
  MousePointer2,
  Network,
  PenTool,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-indigo-400/30 blur-md" />

              <Image
                src="/logo.svg"
                alt="WhizBoard"
                width={38}
                height={38}
                className="relative"
              />
            </div>

            <span className="text-xl font-bold tracking-tight">
              WhizBoard
            </span>
          </Link>


          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">

            <a
              href="#features"
              className="transition hover:text-indigo-600"
            >
              Features
            </a>

            <a
              href="#ai"
              className="transition hover:text-indigo-600"
            >
              AI
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-indigo-600"
            >
              How it works
            </a>

          </nav>


          <div className="flex items-center gap-2">

            <Link
              href="/auth?mode=signin"
              className="
                rounded-xl
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-100
              "
            >
              Log in
            </Link>

            <Link
              href="/auth?mode=signup"
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-indigo-600
                to-violet-600
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-indigo-500/20
                transition
                hover:scale-[1.02]
                hover:shadow-indigo-500/30
              "
            >
              Get started
              <ArrowRight size={15} />
            </Link>

          </div>

        </div>
      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        {/* Decorative blobs */}

        <div className="
          pointer-events-none
          absolute
          -left-40
          top-10
          h-96
          w-96
          rounded-full
          bg-indigo-300/25
          blur-3xl
        " />

        <div className="
          pointer-events-none
          absolute
          right-[-120px]
          top-32
          h-[500px]
          w-[500px]
          rounded-full
          bg-violet-300/20
          blur-3xl
        " />

        <div className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-[400px]
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-cyan-200/20
          blur-3xl
        " />


        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:pb-32 lg:pt-28">

          <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">

            {/* =================================================
                HERO TEXT
            ================================================= */}

            <div>

              <div className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-indigo-200
                bg-indigo-50
                px-4
                py-2
                text-xs
                font-semibold
                text-indigo-700
              ">
                <Sparkles size={14} />
                AI-powered collaborative whiteboard
              </div>


              <h1 className="
                mt-7
                max-w-2xl
                text-5xl
                font-bold
                leading-[1.02]
                tracking-[-0.045em]
                text-slate-950
                sm:text-6xl
                lg:text-[68px]
              ">
                Turn ideas into
                <br />

                <span className="
                  bg-gradient-to-r
                  from-indigo-600
                  via-violet-600
                  to-cyan-500
                  bg-clip-text
                  text-transparent
                ">
                  beautiful diagrams.
                </span>
              </h1>


              <p className="
                mt-7
                max-w-xl
                text-base
                leading-7
                text-slate-600
                sm:text-lg
              ">
                WhizBoard brings AI-assisted diagram generation,
                collaborative workspaces and an infinite canvas
                together in one place.
              </p>


              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/auth?mode=signup"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    to-violet-600
                    px-6
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-xl
                    shadow-indigo-500/20
                    transition
                    hover:-translate-y-0.5
                  "
                >
                  Start creating free
                  <ArrowRight size={16} />
                </Link>


                <a
                  href="#features"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-6
                    py-3.5
                    text-sm
                    font-semibold
                    text-slate-700
                    shadow-sm
                    transition
                    hover:border-indigo-200
                    hover:bg-indigo-50
                    hover:text-indigo-700
                  "
                >
                  Explore WhizBoard
                </a>

              </div>


              {/* Mini benefits */}

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">

                <MiniCheck text="AI diagram generation" />
                <MiniCheck text="Real-time collaboration" />
                <MiniCheck text="Organized workspaces" />

              </div>

            </div>


            {/* =================================================
                DIAGRAM PREVIEW
            ================================================= */}

            <div className="relative">

              {/* Glow */}

              <div className="
                absolute
                inset-10
                rounded-[40px]
                bg-gradient-to-r
                from-indigo-400/30
                via-violet-400/20
                to-cyan-400/20
                blur-3xl
              " />


              <div className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-indigo-100
                bg-white
                shadow-[0_30px_100px_rgba(79,70,229,0.16)]
              ">

                {/* Window header */}

                <div className="
                  flex
                  h-12
                  items-center
                  justify-between
                  border-b
                  border-slate-200
                  bg-white
                  px-4
                ">

                  <div className="flex items-center gap-2">

                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />

                  </div>

                  <div className="
                    rounded-md
                    bg-slate-100
                    px-4
                    py-1
                    text-[10px]
                    text-slate-500
                  ">
                    WhizBoard workspace
                  </div>

                  <div className="w-12" />

                </div>


                {/* Diagram canvas */}

                <div className="
                  relative
                  h-[490px]
                  overflow-hidden
                  bg-[#fbfcff]
                ">

                  {/* Grid */}

                  <div
                    className="
                      absolute
                      inset-0
                      opacity-70
                    "
                    style={{
                      backgroundImage:
                        "radial-gradient(#dbe4f0 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />


                  {/* Toolbar */}

                  <div className="
                    absolute
                    left-4
                    top-4
                    z-10
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white/95
                    p-2
                    shadow-lg
                  ">

                    <ToolIcon icon={<MousePointer2 size={16} />} active />
                    <ToolIcon icon={<PenTool size={16} />} />
                    <ToolIcon icon={<Layers3 size={16} />} />
                    <ToolIcon icon={<Network size={16} />} />

                  </div>


                  {/* AI badge */}

                  <div className="
                    absolute
                    right-5
                    top-5
                    z-10
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-violet-200
                    bg-violet-50
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-violet-700
                    shadow-sm
                  ">
                    <Sparkles size={13} />
                    AI generated
                  </div>


                  {/* User */}

                  <DiagramNode
                    className="left-[17%] top-[22%]"
                    color="blue"
                    title="User"
                    subtitle="Client"
                  />


                  {/* API */}

                  <DiagramNode
                    className="left-[43%] top-[38%]"
                    color="violet"
                    title="API Gateway"
                    subtitle="REST API"
                  />


                  {/* Database */}

                  <DiagramNode
                    className="left-[68%] top-[22%]"
                    color="cyan"
                    title="Database"
                    subtitle="PostgreSQL"
                  />


                  {/* Auth */}

                  <DiagramNode
                    className="left-[25%] top-[67%]"
                    color="green"
                    title="Auth Service"
                    subtitle="Clerk"
                  />


                  {/* Payment */}

                  <DiagramNode
                    className="left-[60%] top-[68%]"
                    color="orange"
                    title="Payment"
                    subtitle="Stripe"
                  />


                  {/* Connections */}

                  <DiagramArrow
                    className="left-[31%] top-[37%] w-[90px]"
                  />

                  <DiagramArrow
                    className="left-[57%] top-[37%] w-[90px]"
                  />

                  <DiagramArrow
                    className="left-[42%] top-[52%] w-[5px]"
                    vertical
                  />

                  <DiagramArrow
                    className="left-[51%] top-[58%] w-[95px]"
                  />


                  {/* Floating AI prompt */}

                  <div className="
                    absolute
                    bottom-5
                    left-5
                    right-5
                    rounded-2xl
                    border
                    border-white
                    bg-slate-950/95
                    p-4
                    text-white
                    shadow-2xl
                  ">

                    <div className="flex items-center gap-2">

                      <div className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-gradient-to-br
                        from-indigo-500
                        to-violet-500
                      ">
                        <Sparkles size={15} />
                      </div>

                      <div>

                        <p className="text-xs font-semibold">
                          AI Helper
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Describe what you want to create
                        </p>

                      </div>

                    </div>

                    <div className="
                      mt-3
                      rounded-xl
                      bg-white/10
                      px-3
                      py-2.5
                      text-xs
                      text-slate-200
                    ">
                      Create a system architecture for an
                      e-commerce application...
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURE STRIP
      ===================================================== */}

      <section
        id="features"
        className="border-y border-slate-200 bg-slate-50"
      >

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="mx-auto max-w-2xl text-center">

            <div className="
              mx-auto
              inline-flex
              items-center
              rounded-full
              bg-indigo-100
              px-3
              py-1.5
              text-xs
              font-semibold
              text-indigo-700
            ">
              Everything you need
            </div>

            <h2 className="
              mt-4
              text-3xl
              font-bold
              tracking-tight
              sm:text-4xl
            ">
              A better canvas for
              <span className="text-indigo-600">
                {" "}better ideas.
              </span>
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              From quick sketches to complex system designs,
              WhizBoard keeps your ideas visual and organized.
            </p>

          </div>


          <div className="
            mt-14
            grid
            gap-5
            md:grid-cols-2
            lg:grid-cols-4
          ">

            <FeatureCard
              icon={<Sparkles />}
              iconClass="bg-violet-100 text-violet-600"
              title="AI-powered creation"
              description="Describe a diagram in natural language and turn it into editable visual elements."
            />

            <FeatureCard
              icon={<Users />}
              iconClass="bg-blue-100 text-blue-600"
              title="Live collaboration"
              description="Work together on boards and keep everyone aligned in the same workspace."
            />

            <FeatureCard
              icon={<Layers3 />}
              iconClass="bg-emerald-100 text-emerald-600"
              title="Organized workspaces"
              description="Manage boards, projects and shared work in a structured workspace."
            />

            <FeatureCard
              icon={<Zap />}
              iconClass="bg-orange-100 text-orange-600"
              title="Fast workflow"
              description="Go from an idea to a useful diagram without switching between multiple tools."
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          AI SECTION
      ===================================================== */}

      <section id="ai">

        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            <div>

              <div className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-violet-100
                px-3
                py-2
                text-xs
                font-semibold
                text-violet-700
              ">
                <BrainCircuit size={15} />
                AI assistance
              </div>

              <h2 className="
                mt-5
                text-3xl
                font-bold
                tracking-tight
                sm:text-4xl
              ">
                Explain it.
                <br />

                <span className="text-violet-600">
                  WhizBoard visualizes it.
                </span>
              </h2>

              <p className="
                mt-5
                max-w-lg
                text-base
                leading-7
                text-slate-600
              ">
                Ask WhizBoard to build a flowchart, system
                architecture, process diagram or visual
                explanation from a simple natural-language
                prompt.
              </p>

              <div className="mt-8 space-y-4">

                <CheckItem text="Generate structured diagrams" />
                <CheckItem text="Keep every generated element editable" />
                <CheckItem text="Refine diagrams using AI" />
                <CheckItem text="Continue working on the infinite canvas" />

              </div>

            </div>


            {/* Prompt card */}

            <div className="
              rounded-3xl
              border
              border-violet-100
              bg-gradient-to-br
              from-indigo-50
              via-white
              to-violet-50
              p-6
              shadow-xl
              shadow-violet-100/40
            ">

              <div className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
              ">

                <div className="flex items-center gap-3">

                  <div className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-indigo-500
                    to-violet-600
                    text-white
                  ">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      AI Helper
                    </p>

                    <p className="text-xs text-slate-500">
                      Generate a diagram
                    </p>
                  </div>

                </div>


                <div className="
                  mt-5
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-4
                  text-sm
                  leading-6
                  text-slate-700
                ">
                  Create a system architecture diagram
                  containing a user, frontend, API gateway,
                  authentication service, database and
                  payment service.
                </div>


                <button className="
                  mt-4
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-indigo-500/20
                ">
                  <Sparkles size={15} />
                  Generate diagram
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="
          border-y
          border-slate-200
          bg-gradient-to-b
          from-slate-50
          to-white
        "
      >

        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">

            <p className="text-sm font-semibold text-indigo-600">
              SIMPLE WORKFLOW
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From idea to canvas
            </h2>

          </div>


          <div className="
            mt-14
            grid
            gap-6
            md:grid-cols-3
          ">

            <Step
              number="01"
              title="Create a workspace"
              description="Create a focused space for your project, team or ideas."
              gradient="from-blue-500 to-cyan-500"
            />

            <Step
              number="02"
              title="Build your diagram"
              description="Use the infinite canvas to draw, connect and organize ideas."
              gradient="from-indigo-500 to-violet-500"
            />

            <Step
              number="03"
              title="Let AI help"
              description="Generate and refine diagrams using natural-language prompts."
              gradient="from-violet-500 to-fuchsia-500"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="px-6 py-20 lg:py-24">

        <div className="
          relative
          mx-auto
          max-w-6xl
          overflow-hidden
          rounded-[32px]
          bg-gradient-to-r
          from-indigo-600
          via-violet-600
          to-fuchsia-600
          px-8
          py-16
          text-center
          text-white
          shadow-2xl
          shadow-violet-500/20
          sm:px-12
        ">

          <div className="
            pointer-events-none
            absolute
            -left-20
            top-0
            h-64
            w-64
            rounded-full
            bg-white/10
            blur-3xl
          />

          <div className="
            pointer-events-none
            absolute-right-20
            bottom-0
            h-64
            w-64
            rounded-full
            bg-cyan-300
            blur-3xl
          />

          <div className="relative">

            <Sparkles className="mx-auto mb-5" size={26} />

            <h2 className="
              text-3xl
              font-bold
              tracking-tight
              sm:text-4xl
            ">
              Your next idea starts here.
            </h2>

            <p className="
              mx-auto
              mt-4
              max-w-xl
              text-sm
              leading-6
              text-indigo-100
            ">
              Create your first WhizBoard workspace and
              start turning ideas into visual systems.
            </p>

            <Link
              href="/auth?mode=signup"
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-white
                px-6
                py-3.5
                text-sm
                font-semibold
                text-indigo-700
                shadow-lg
                transition
                hover:scale-[1.02]
              "
            >
              Get started free
              <ArrowRight size={16} />
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="
          mx-auto
          flex
          max-w-7xl
          flex-col
          gap-3
          px-6
          py-8
          text-sm
          text-slate-500
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <Image
              src="/logo.svg"
              alt="WhizBoard"
              width={25}
              height={25}
            />

            <span className="font-semibold text-slate-800">
              WhizBoard
            </span>
          </Link>

          <p>
            Create. Collaborate. Visualize.
          </p>

        </div>

      </footer>

    </main>
  )
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function MiniCheck({
  text,
}: {
  text: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">

      <span className="
        flex
        h-5
        w-5
        items-center
        justify-center
        rounded-full
        bg-emerald-100
        text-emerald-600
      ">
        <Check size={11} />
      </span>

      {text}

    </div>
  )
}


function CheckItem({
  text,
}: {
  text: string
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-700">

      <span className="
        flex
        h-6
        w-6
        items-center
        justify-center
        rounded-full
        bg-emerald-100
        text-emerald-600
      ">
        <Check size={13} />
      </span>

      {text}

    </div>
  )
}


function FeatureCard({
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
    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-6
      shadow-sm
      transition
      hover:-translate-y-1
      hover:shadow-xl
    ">

      <div className={`
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        ${iconClass}
      `}>
        {icon}
      </div>

      <h3 className="mt-5 text-sm font-semibold">
        {title}
      </h3>

      <p className="
        mt-2
        text-sm
        leading-6
        text-slate-500
      ">
        {description}
      </p>

    </div>
  )
}


function Step({
  number,
  title,
  description,
  gradient,
}: {
  number: string
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-7
      shadow-sm
    ">

      <div className={`
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        bg-gradient-to-br
        ${gradient}
        text-xs
        font-bold
        text-white
      `}>
        {number}
      </div>

      <h3 className="mt-6 text-base font-semibold">
        {title}
      </h3>

      <p className="
        mt-2
        text-sm
        leading-6
        text-slate-500
      ">
        {description}
      </p>

    </div>
  )
}


/* =========================================================
   DIAGRAM
========================================================= */

function DiagramNode({
  className,
  color,
  title,
  subtitle,
}: {
  className: string
  color: "blue" | "violet" | "cyan" | "green" | "orange"
  title: string
  subtitle: string
}) {
  const styles = {
    blue: "border-blue-200 bg-blue-50",
    violet: "border-violet-200 bg-violet-50",
    cyan: "border-cyan-200 bg-cyan-50",
    green: "border-emerald-200 bg-emerald-50",
    orange: "border-orange-200 bg-orange-50",
  }

  const dots = {
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    cyan: "bg-cyan-500",
    green: "bg-emerald-500",
    orange: "bg-orange-500",
  }

  return (
    <div className={`absolute ${className}`}>

      <div className={`
        min-w-[120px]
        rounded-xl
        border
        px-4
        py-3
        shadow-sm
        ${styles[color]}
      `}>

        <div className="flex items-center gap-2">

          <span className={`
            h-2.5
            w-2.5
            rounded-full
            ${dots[color]}
          `} />

          <span className="text-xs font-semibold text-slate-800">
            {title}
          </span>

        </div>

        <p className="mt-1 text-[10px] text-slate-500">
          {subtitle}
        </p>

      </div>

    </div>
  )
}


function DiagramArrow({
  className,
  vertical = false,
}: {
  className: string
  vertical?: boolean
}) {
  return (
    <div
      className={`
        absolute
        bg-slate-300
        ${vertical ? "h-[72px] w-px" : "h-px"}
        ${className}
      `}
    />
  )
}


function ToolIcon({
  icon,
  active = false,
}: {
  icon: React.ReactNode
  active?: boolean
}) {
  return (
    <div className={`
      flex
      h-9
      w-9
      items-center
      justify-center
      rounded-lg
      ${
        active
          ? "bg-indigo-100 text-indigo-600"
          : "text-slate-500 hover:bg-slate-100"
      }
    `}>
      {icon}
    </div>
  )
}
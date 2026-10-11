"use client"

import { useState } from "react"
import { SignIn, SignUp } from "@clerk/nextjs"
import Image from "next/image"

type AuthMode = "signin" | "signup"

export default function LandingAuth() {
  const [mode, setMode] = useState<AuthMode>("signin")

  return (
    <div className="w-full max-w-[430px]">
      {/* Auth card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xl">

        {/* Logo + heading */}
        <div className="px-8 pt-8 text-center">

          <div className="mb-4 flex justify-center">
            <Image
              src="/logo.svg"
              alt="WhizBoard"
              width={48}
              height={48}
            />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {mode === "signin"
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to continue to WhizBoard"
              : "Start creating smarter whiteboards with AI"}
          </p>
        </div>

        {/* Switch */}
        <div className="px-8 pt-6">
          <div className="grid grid-cols-2 rounded-lg bg-muted p-1">

            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`
                rounded-md
                py-2.5
                text-sm
                font-medium
                transition-all
                ${
                  mode === "signin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`
                rounded-md
                py-2.5
                text-sm
                font-medium
                transition-all
                ${
                  mode === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Sign up
            </button>

          </div>
        </div>

        {/* Clerk */}
        <div className="px-6 pb-6 pt-4">

          {mode === "signin" ? (
            <SignIn
              routing="hash"
              forceRedirectUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: "#111827",
                  borderRadius: "0.65rem",
                },

                elements: {
                  rootBox: "w-full",
                  card: "w-full border-0 shadow-none p-0",
                  header: "hidden",

                  socialButtonsBlockButton:
                    "h-11 border-border bg-background text-foreground hover:bg-muted",

                  socialButtonsBlockButtonText:
                    "text-sm font-medium",

                  dividerLine:
                    "bg-muted-foreground/20",

                  dividerText:
                    "text-xs border-border",

                  formFieldLabel:
                    "text-sm font-medium text-foreground",

                  formFieldInput:
                    "h-11 border-border bg-background text-sm shadow-none",

                  formButtonPrimary:
                    "h-11 bg-gray-900 hover:bg-gray-800 text-sm font-medium shadow-none",

                  footerAction:
                    "hidden",

                  footerActionLink:
                    "hidden",

                  identityPreviewText:
                    "text-sm",

                  formFieldErrorText:
                    "text-xs text-red-500",
                },

                options: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              forceRedirectUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: "#111827",
                  borderRadius: "0.65rem",
                },

                elements: {
                  rootBox: "w-full",
                  card: "w-full border-0 shadow-none p-0",
                  header: "hidden",

                  socialButtonsBlockButton:
                    "h-11 border-border bg-background text-foreground hover:bg-muted",

                  socialButtonsBlockButtonText:
                    "text-sm font-medium",

                  dividerLine:
                    "bg-muted-foreground/20",

                  dividerText:
                    "text-xs border-border",

                  formFieldLabel:
                    "text-sm font-medium text-foreground",

                  formFieldInput:
                    "h-11 border-border bg-background text-sm shadow-none",

                  formButtonPrimary:
                    "h-11 bg-gray-900 hover:bg-gray-800 text-sm font-medium shadow-none",

                  footerAction:
                    "hidden",

                  footerActionLink:
                    "hidden",

                  formFieldErrorText:
                    "text-xs text-red-500",
                },

                options: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
              }}
            />
          )}

        </div>

      </div>

      {/* Footer */}
      <p className="mt-5 text-center text-xs text-muted-foreground">
        By continuing, you agree to WhizBoard's terms and privacy policy.
      </p>
    </div>
  )
}

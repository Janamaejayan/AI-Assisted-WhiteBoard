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
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

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

          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            {mode === "signin"
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {mode === "signin"
              ? "Sign in to continue to WhizBoard"
              : "Start creating smarter whiteboards with AI"}
          </p>
        </div>

        {/* Switch */}
        <div className="px-8 pt-6">
          <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1">

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
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
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
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
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
                    "h-11 border-gray-200 bg-white text-gray-800 hover:bg-gray-50",

                  socialButtonsBlockButtonText:
                    "text-sm font-medium",

                  dividerLine:
                    "bg-gray-200",

                  dividerText:
                    "text-xs text-gray-400",

                  formFieldLabel:
                    "text-sm font-medium text-gray-700",

                  formFieldInput:
                    "h-11 border-gray-200 bg-white text-sm shadow-none",

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
                    "h-11 border-gray-200 bg-white text-gray-800 hover:bg-gray-50",

                  socialButtonsBlockButtonText:
                    "text-sm font-medium",

                  dividerLine:
                    "bg-gray-200",

                  dividerText:
                    "text-xs text-gray-400",

                  formFieldLabel:
                    "text-sm font-medium text-gray-700",

                  formFieldInput:
                    "h-11 border-gray-200 bg-white text-sm shadow-none",

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
      <p className="mt-5 text-center text-xs text-gray-500">
        By continuing, you agree to WhizBoard's terms and privacy policy.
      </p>
    </div>
  )
}
"use client"

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export default function SSOCallbackPage() {
  const clerk = useClerk()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const router = useRouter()

  const hasRun = useRef(false)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!clerk.loaded || hasRun.current) {
        return
      }

      hasRun.current = true

      try {
        // ---------------------------------------------
        // CASE 1: OAuth completed as sign-in
        // ---------------------------------------------

        if (signIn.status === "complete") {
          await signIn.finalize({
            navigate: ({ session, decorateUrl }) => {
              if (session?.currentTask) {
                console.log(
                  "Session task:",
                  session.currentTask
                )
                return
              }

              const url = decorateUrl("/dashboard")

              if (url.startsWith("http")) {
                window.location.href = url
              } else {
                router.push(url)
              }
            },
          })

          return
        }

        // ---------------------------------------------
        // CASE 2:
        // OAuth needs to transfer to SIGN UP
        // ---------------------------------------------

        if (signIn.isTransferable) {
          const { error } =
            await signUp.create({
              transfer: true,
            })

          if (error) {
            console.error(
              "Sign-up transfer error:",
              error
            )

            router.push(
              "/auth?mode=signup&error=oauth"
            )

            return
          }

          // Sign-up completed immediately
          if (signUp.status === "complete") {
            await signUp.finalize({
              navigate: ({ session, decorateUrl }) => {
                if (session?.currentTask) {
                  console.log(
                    "Session task:",
                    session.currentTask
                  )
                  return
                }

                const url =
                  decorateUrl("/dashboard")

                if (url.startsWith("http")) {
                  window.location.href = url
                } else {
                  router.push(url)
                }
              },
            })

            return
          }

          // Additional information required
          if (
            signUp.status ===
            "missing_requirements"
          ) {
            router.push(
              "/auth?mode=signup&continue=true"
            )

            return
          }
        }

        // ---------------------------------------------
        // CASE 3:
        // OAuth created a sign-up directly
        // ---------------------------------------------

        if (
          signUp.status === "complete"
        ) {
          await signUp.finalize({
            navigate: ({ session, decorateUrl }) => {
              if (session?.currentTask) {
                console.log(
                  "Session task:",
                  session.currentTask
                )
                return
              }

              const url =
                decorateUrl("/dashboard")

              if (url.startsWith("http")) {
                window.location.href = url
              } else {
                router.push(url)
              }
            },
          })

          return
        }

        // ---------------------------------------------
        // Something is incomplete
        // ---------------------------------------------

        console.error(
          "OAuth flow incomplete",
          {
            signInStatus: signIn.status,
            signUpStatus: signUp.status,
            signInTransferable:
              signIn.isTransferable,
            signUpTransferable:
              signUp.isTransferable,
          }
        )

        router.push("/auth")
      } catch (error) {
        console.error(
          "OAuth callback failed:",
          error
        )

        hasRun.current = false

        router.push(
          "/auth?error=oauth_failed"
        )
      }
    }

    handleOAuthCallback()
  }, [clerk.loaded, signIn, signUp, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
      <div className="text-center">

        <div className="
          mx-auto
          mb-4
          h-10
          w-10
          animate-spin
          rounded-full
          border-2
          border-gray-200
          border-t-gray-950"
        />

        <h1 className="text-sm font-semibold text-gray-900">
          Signing you in...
        </h1>

        <p className="mt-1 text-xs text-gray-500">
          Completing authentication.
        </p>

      </div>
    </div>
  )
}
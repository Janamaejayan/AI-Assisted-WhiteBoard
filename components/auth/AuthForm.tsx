"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  useSignIn,
  useSignUp,
} from "@clerk/nextjs"

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Github,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react"


type AuthMode = "signin" | "signup"

type FormStep =
  | "auth"
  | "verify-email"
  | "forgot-password"
  | "reset-code"
  | "new-password"


interface AuthFormProps {
  initialMode: AuthMode
}


export default function AuthForm({
  initialMode,
}: AuthFormProps) {

  const router = useRouter()

  const {
    signIn,
    errors: signInErrors,
    fetchStatus: signInFetchStatus,
  } = useSignIn()

  const {
    signUp,
    errors: signUpErrors,
    fetchStatus: signUpFetchStatus,
  } = useSignUp()


  /* =========================================================
     STATE
  ========================================================= */

  const [mode, setMode] =
    useState<AuthMode>(initialMode)

  const [step, setStep] =
    useState<FormStep>("auth")


  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [confirmPassword, setConfirmPassword] =
    useState("")

  const [code, setCode] =
    useState("")


  const [showPassword, setShowPassword] =
    useState(false)

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)


  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState("")

  const [loading, setLoading] =
    useState(false)


  const isFetching =
    signInFetchStatus === "fetching" ||
    signUpFetchStatus === "fetching"


  /* =========================================================
     CLEAR MESSAGES
  ========================================================= */

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }


  /* =========================================================
     CHANGE SIGN IN / SIGN UP
  ========================================================= */

  const changeMode = (
    newMode: AuthMode
  ) => {

    setMode(newMode)

    setStep("auth")

    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setCode("")

    setShowPassword(false)
    setShowConfirmPassword(false)

    clearMessages()
  }


  /* =========================================================
     FINALIZE SIGN IN
  ========================================================= */

  const finalizeSignIn = async () => {

    try {

      await signIn.finalize({
        navigate: ({
          session,
          decorateUrl,
        }) => {

          /*
           * Clerk may require a session task
           * such as device trust or another
           * required step.
           */

          if (session?.currentTask) {
            console.log(
              "Pending session task:",
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

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete sign in."
      )

    }
  }


  /* =========================================================
     FINALIZE SIGN UP
  ========================================================= */

  const finalizeSignUp = async () => {

    try {

      await signUp.finalize({
        navigate: ({
          session,
          decorateUrl,
        }) => {

          if (session?.currentTask) {
            console.log(
              "Pending session task:",
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

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete sign up."
      )

    }
  }


  /* =========================================================
     SIGN IN
  ========================================================= */

  const handleSignIn = async (
    event: React.FormEvent
  ) => {

    event.preventDefault()

    clearMessages()


    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }


    if (!password) {
      setError("Please enter your password.")
      return
    }


    setLoading(true)


    try {

      const { error } =
        await signIn.password({
          emailAddress: email.trim(),
          password,
        })


      if (error) {

        setError(
          error.message ||
            "Unable to sign in."
        )

        return
      }


      /*
       * A successful password authentication
       * still needs finalize() to activate
       * the session.
       */

      if (signIn.status === "complete") {

        await finalizeSignIn()
        return
      }


      /*
       * These states are possible with
       * additional security requirements.
       */

      if (
        signIn.status ===
        "needs_second_factor"
      ) {

        setError(
          "Additional verification is required for this account."
        )

        return
      }


      if (
        signIn.status ===
        "needs_client_trust"
      ) {

        setError(
          "This device requires additional verification."
        )

        return
      }


      setError(
        "Additional authentication is required."
      )

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      )

    } finally {

      setLoading(false)

    }
  }


  /* =========================================================
     SIGN UP
  ========================================================= */

  const handleSignUp = async (
    event: React.FormEvent
  ) => {

    event.preventDefault()

    clearMessages()


    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }


    if (!password) {
      setError("Please create a password.")
      return
    }


    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      )

      return
    }


    if (
      password !==
      confirmPassword
    ) {

      setError(
        "Passwords do not match."
      )

      return
    }


    setLoading(true)


    try {

      const { error } =
        await signUp.password({
          emailAddress: email.trim(),
          password,
        })


      if (error) {

        setError(
          error.message ||
            "Unable to create your account."
        )

        return
      }


      /*
       * Send the email verification code.
       */

      const {
        error: verificationError,
      } =
        await signUp.verifications.sendEmailCode()


      if (verificationError) {

        setError(
          verificationError.message ||
            "Unable to send verification code."
        )

        return
      }


      setStep("verify-email")

      setSuccess(
        `We sent a verification code to ${email.trim()}.`
      )

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      )

    } finally {

      setLoading(false)

    }
  }


  /* =========================================================
     VERIFY EMAIL
  ========================================================= */

  const handleVerifyEmail = async (
    event: React.FormEvent
  ) => {

    event.preventDefault()

    clearMessages()


    if (!code.trim()) {

      setError(
        "Please enter the verification code."
      )

      return
    }


    setLoading(true)


    try {

      const { error } =
        await signUp.verifications.verifyEmailCode({
          code: code.trim(),
        })


      if (error) {

        setError(
          error.message ||
            "Invalid verification code."
        )

        return
      }


      if (
        signUp.status === "complete"
      ) {

        await finalizeSignUp()
        return
      }


      setError(
        "Additional information is required to complete your account."
      )

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify your email."
      )

    } finally {

      setLoading(false)

    }
  }


  /* =========================================================
     RESEND VERIFICATION CODE
  ========================================================= */

  const resendVerificationCode =
    async () => {

      clearMessages()
      setLoading(true)

      try {

        const { error } =
          await signUp.verifications.sendEmailCode()


        if (error) {

          setError(
            error.message ||
              "Unable to resend the code."
          )

          return
        }


        setSuccess(
          `A new verification code was sent to ${email}.`
        )

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Unable to resend the code."
        )

      } finally {

        setLoading(false)

      }
    }


  /* =========================================================
     START FORGOT PASSWORD
  ========================================================= */

  const startForgotPassword =
    async (
      event: React.FormEvent
    ) => {

      event.preventDefault()

      clearMessages()


      if (!email.trim()) {

        setError(
          "Enter your email address first."
        )

        return
      }


      setLoading(true)


      try {

        /*
         * Create a sign-in attempt for the
         * supplied identifier.
         */

        const {
          error: createError,
        } =
          await signIn.create({
            identifier: email.trim(),
          })


        if (createError) {

          setError(
            createError.message ||
              "Unable to start password reset."
          )

          return
        }


        /*
         * Send the password reset code.
         */

        const {
          error: sendCodeError,
        } =
          await signIn.resetPasswordEmailCode.sendCode()


        if (sendCodeError) {

          setError(
            sendCodeError.message ||
              "Unable to send the reset code."
          )

          return
        }


        setStep("reset-code")

        setSuccess(
          `A password reset code was sent to ${email.trim()}.`
        )

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Unable to start password reset."
        )

      } finally {

        setLoading(false)

      }
    }


  /* =========================================================
     VERIFY RESET CODE
  ========================================================= */

  const verifyResetCode =
    async (
      event: React.FormEvent
    ) => {

      event.preventDefault()

      clearMessages()


      if (!code.trim()) {

        setError(
          "Please enter the reset code."
        )

        return
      }


      setLoading(true)


      try {

        const { error } =
          await signIn.resetPasswordEmailCode.verifyCode({
            code: code.trim(),
          })


        if (error) {

          setError(
            error.message ||
              "Invalid reset code."
          )

          return
        }


        setStep("new-password")

        setCode("")


      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify reset code."
        )

      } finally {

        setLoading(false)

      }
    }


  /* =========================================================
     SUBMIT NEW PASSWORD
  ========================================================= */

  const submitNewPassword =
    async (
      event: React.FormEvent
    ) => {

      event.preventDefault()

      clearMessages()


      if (!password) {

        setError(
          "Please enter a new password."
        )

        return
      }


      if (password.length < 8) {

        setError(
          "Password must contain at least 8 characters."
        )

        return
      }


      if (
        password !==
        confirmPassword
      ) {

        setError(
          "Passwords do not match."
        )

        return
      }


      setLoading(true)


      try {

        const { error } =
          await signIn
            .resetPasswordEmailCode
            .submitPassword({
              password,
              signOutOfOtherSessions: true,
            })


        if (error) {

          setError(
            error.message ||
              "Unable to reset password."
          )

          return
        }


        if (
          signIn.status ===
          "complete"
        ) {

          await finalizeSignIn()
          return
        }


        setError(
          "Password reset requires another authentication step."
        )

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Unable to reset password."
        )

      } finally {

        setLoading(false)

      }
    }


  /* =========================================================
     OAUTH
  ========================================================= */

  const handleOAuth = async (
    strategy:
      | "oauth_google"
      | "oauth_github"
  ) => {

    clearMessages()
    setLoading(true)


    try {

      /*
       * Start from signIn for the combined
       * sign-in/sign-up OAuth flow.
       *
       * Clerk can transfer the attempt to
       * sign-up when appropriate.
       */

      const { error } =
        await signIn.sso({
          strategy,

          redirectCallbackUrl:
            "/auth/sso-callback",

          redirectUrl:
            "/dashboard",
        })


      if (error) {

        setError(
          error.message ||
            "Unable to continue with OAuth."
        )

      }

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "OAuth authentication failed."
      )

    } finally {

      setLoading(false)

    }
  }


  /* =========================================================
     BACK
  ========================================================= */

  const goBack = () => {

    clearMessages()

    setCode("")
    setPassword("")
    setConfirmPassword("")

    setStep("auth")

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="w-full max-w-[450px]">

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-indigo-100
        bg-white
        shadow-[0_25px_80px_rgba(79,70,229,0.14)]
      ">

        {/* Top gradient line */}

        <div className="
          absolute
          left-0
          right-0
          top-0
          h-1
          bg-gradient-to-r
          from-indigo-500
          via-violet-500
          to-cyan-400
        " />


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="px-7 pt-8">

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
              shadow-lg
              shadow-indigo-500/20
            ">
              <Sparkles size={18} />
            </div>

            <div>

              <p className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-indigo-600
              ">
                WhizBoard
              </p>

              <p className="text-xs text-slate-400">
                Visualize your ideas
              </p>

            </div>

          </div>


          <h2 className="
            mt-7
            text-2xl
            font-bold
            tracking-tight
            text-slate-950
          ">
            {step === "verify-email"
              ? "Verify your email"
              : step === "forgot-password"
                ? "Reset your password"
                : step === "reset-code"
                  ? "Enter reset code"
                  : step === "new-password"
                    ? "Create a new password"
                    : mode === "signin"
                      ? "Welcome back"
                      : "Create your account"}
          </h2>


          <p className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          ">

            {step === "verify-email"
              ? `Enter the verification code we sent to ${email}.`

              : step === "forgot-password"
                ? "Enter your email and we'll send you a password reset code."

                : step === "reset-code"
                  ? `We sent a password reset code to ${email}.`

                  : step === "new-password"
                    ? "Choose a strong new password for your account."

                    : mode === "signin"
                      ? "Sign in to continue to your workspace."

                      : "Start creating smarter visual workspaces."}

          </p>

        </div>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="px-7 pb-7 pt-6">


          {/* =================================================
              AUTH MODE SWITCH
          ================================================= */}

          {step === "auth" && (

            <div className="
              mb-6
              grid
              grid-cols-2
              rounded-xl
              bg-indigo-50
              p-1
            ">

              <button
                type="button"
                onClick={() =>
                  changeMode("signin")
                }
                className={`
                  rounded-lg
                  py-2.5
                  text-sm
                  font-semibold
                  transition-all
                  ${
                    mode === "signin"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }
                `}
              >
                Sign in
              </button>


              <button
                type="button"
                onClick={() =>
                  changeMode("signup")
                }
                className={`
                  rounded-lg
                  py-2.5
                  text-sm
                  font-semibold
                  transition-all
                  ${
                    mode === "signup"
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }
                `}
              >
                Sign up
              </button>

            </div>
          )}


          {/* =================================================
              VERIFICATION / RESET BACK
          ================================================= */}

          {step !== "auth" && (

            <button
              type="button"
              onClick={goBack}
              className="
                mb-5
                flex
                items-center
                gap-2
                text-xs
                font-medium
                text-slate-500
                transition
                hover:text-indigo-600
              "
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}


          {/* =================================================
              OAUTH + EMAIL AUTH
          ================================================= */}

          {step === "auth" && (

            <>
              {/* OAuth */}

              <div className="grid gap-3 sm:grid-cols-2">

                <OAuthButton
                  provider="Google"
                  icon={<GoogleIcon />}
                  onClick={() =>
                    handleOAuth(
                      "oauth_google"
                    )
                  }
                  disabled={
                    loading ||
                    isFetching
                  }
                />


                <OAuthButton
                  provider="GitHub"
                  icon={
                    <Github size={17} />
                  }
                  onClick={() =>
                    handleOAuth(
                      "oauth_github"
                    )
                  }
                  disabled={
                    loading ||
                    isFetching
                  }
                />

              </div>


              {/* Divider */}

              <div className="my-6 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="
                  whitespace-nowrap
                  text-[10px]
                  font-semibold
                  tracking-wider
                  text-slate-400
                ">
                  OR CONTINUE WITH EMAIL
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>


              {/* Email/password */}

              <form
                onSubmit={
                  mode === "signin"
                    ? handleSignIn
                    : handleSignUp
                }
                className="space-y-4"
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Email
                  </label>

                  <div className="relative">

                    <Mail
                      size={17}
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        pl-10
                        pr-3
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-indigo-400
                        focus:ring-4
                        focus:ring-indigo-100
                      "
                    />

                  </div>

                </div>


                {/* PASSWORD */}

                <div>

                  <div className="
                    mb-2
                    flex
                    items-center
                    justify-between
                  ">

                    <label
                      htmlFor="password"
                      className="
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >
                      Password
                    </label>


                    {mode === "signin" && (

                      <button
                        type="button"
                        onClick={() => {
                          setStep(
                            "forgot-password"
                          )

                          clearMessages()
                        }}
                        className="
                          text-xs
                          font-medium
                          text-indigo-600
                          transition
                          hover:text-violet-600
                        "
                      >
                        Forgot password?
                      </button>
                    )}

                  </div>


                  <div className="relative">

                    <LockKeyhole
                      size={17}
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />


                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      autoComplete={
                        mode === "signin"
                          ? "current-password"
                          : "new-password"
                      }
                      placeholder="Enter your password"
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        pl-10
                        pr-11
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-indigo-400
                        focus:ring-4
                        focus:ring-indigo-100
                      "
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                        transition
                        hover:text-slate-700
                      "
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>

                </div>


                {/* CONFIRM PASSWORD */}

                {mode === "signup" && (

                  <div>

                    <label
                      htmlFor="confirm-password"
                      className="
                        mb-2
                        block
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >
                      Confirm password
                    </label>


                    <div className="relative">

                      <LockKeyhole
                        size={17}
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />


                      <input
                        id="confirm-password"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={
                          confirmPassword
                        }
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        className="
                          h-12
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          pl-10
                          pr-11
                          text-sm
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          hover:border-slate-300
                          focus:border-violet-400
                          focus:ring-4
                          focus:ring-violet-100
                        "
                      />


                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                          transition
                          hover:text-slate-700
                        "
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>

                    </div>

                  </div>
                )}


                {/* ERROR */}

                {error && (
                  <MessageBox
                    type="error"
                    message={error}
                  />
                )}


                {/* SUCCESS */}

                {success && (
                  <MessageBox
                    type="success"
                    message={success}
                  />
                )}


                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    isFetching
                  }
                  className="
                    mt-2
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    via-violet-600
                    to-violet-600
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-indigo-500/20
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-xl
                    hover:shadow-indigo-500/25
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {(loading ||
                    isFetching) && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {mode === "signin"
                    ? "Sign in to WhizBoard"
                    : "Create WhizBoard account"}

                  {!loading &&
                    !isFetching && (
                      <ArrowRightIcon />
                    )}

                </button>

              </form>


              {/* Footer text */}

              <p className="
                mt-5
                text-center
                text-[11px]
                leading-5
                text-slate-400
              ">
                By continuing, you agree to
                WhizBoard's Terms and Privacy Policy.
              </p>

            </>
          )}


          {/* =================================================
              VERIFY EMAIL
          ================================================= */}

          {step === "verify-email" && (

            <form
              onSubmit={handleVerifyEmail}
              className="space-y-5"
            >

              <div>

                <label
                  htmlFor="verification-code"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Verification code
                </label>


                <input
                  id="verification-code"
                  type="text"
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value
                    )
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter your code"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-center
                    text-lg
                    font-semibold
                    tracking-[0.35em]
                    outline-none
                    transition
                    placeholder:text-slate-400
                    placeholder:tracking-normal
                    focus:border-indigo-400
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

              </div>


              {error && (
                <MessageBox
                  type="error"
                  message={error}
                />
              )}

              {success && (
                <MessageBox
                  type="success"
                  message={success}
                />
              )}


              <button
                type="submit"
                disabled={
                  loading ||
                  isFetching
                }
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-indigo-500/20
                  transition
                  hover:-translate-y-0.5
                  disabled:opacity-60
                "
              >

                {(loading ||
                  isFetching) && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                Verify email

              </button>


              <button
                type="button"
                onClick={
                  resendVerificationCode
                }
                disabled={
                  loading ||
                  isFetching
                }
                className="
                  w-full
                  text-xs
                  font-semibold
                  text-indigo-600
                  hover:text-violet-600
                  disabled:opacity-50
                "
              >
                Resend verification code
              </button>

            </form>
          )}


          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          {step === "forgot-password" && (

            <form
              onSubmit={
                startForgotPassword
              }
              className="space-y-5"
            >

              <div>

                <label
                  htmlFor="reset-email"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Email
                </label>


                <div className="relative">

                  <Mail
                    size={17}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />


                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-10
                      pr-3
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-indigo-400
                      focus:ring-4
                      focus:ring-indigo-100
                    "
                  />

                </div>

              </div>


              {error && (
                <MessageBox
                  type="error"
                  message={error}
                />
              )}

              {success && (
                <MessageBox
                  type="success"
                  message={success}
                />
              )}


              <button
                type="submit"
                disabled={
                  loading ||
                  isFetching
                }
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-indigo-500/20
                  disabled:opacity-60
                "
              >

                {(loading ||
                  isFetching) && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                Send reset code

              </button>

            </form>
          )}


          {/* =================================================
              RESET CODE
          ================================================= */}

          {step === "reset-code" && (

            <form
              onSubmit={
                verifyResetCode
              }
              className="space-y-5"
            >

              <div>

                <label
                  htmlFor="reset-code"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Reset code
                </label>


                <input
                  id="reset-code"
                  type="text"
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value
                    )
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter your reset code"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    text-center
                    text-lg
                    font-semibold
                    tracking-[0.35em]
                    outline-none
                    placeholder:text-slate-400
                    placeholder:tracking-normal
                    focus:border-indigo-400
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

              </div>


              {error && (
                <MessageBox
                  type="error"
                  message={error}
                />
              )}

              {success && (
                <MessageBox
                  type="success"
                  message={success}
                />
              )}


              <button
                type="submit"
                disabled={
                  loading ||
                  isFetching
                }
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-indigo-500/20
                  disabled:opacity-60
                "
              >

                {(loading ||
                  isFetching) && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                Verify reset code

              </button>

            </form>
          )}


          {/* =================================================
              NEW PASSWORD
          ================================================= */}

          {step === "new-password" && (

            <form
              onSubmit={
                submitNewPassword
              }
              className="space-y-4"
            >

              <div>

                <label
                  htmlFor="new-password"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  New password
                </label>


                <div className="relative">

                  <LockKeyhole
                    size={17}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />


                  <input
                    id="new-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Create a new password"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      pl-10
                      pr-11
                      outline-none
                      focus:border-indigo-400
                      focus:ring-4
                      focus:ring-indigo-100
                    "
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>


              <div>

                <label
                  htmlFor="new-confirm-password"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Confirm new password
                </label>


                <input
                  id="new-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    px-3
                    outline-none
                    focus:border-indigo-400
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

              </div>


              {error && (
                <MessageBox
                  type="error"
                  message={error}
                />
              )}


              <button
                type="submit"
                disabled={
                  loading ||
                  isFetching
                }
                className="
                  mt-2
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-indigo-500/20
                  disabled:opacity-60
                "
              >

                {(loading ||
                  isFetching) && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                Update password

              </button>

            </form>
          )}

        </div>

      </div>


      {/* =====================================================
          SECURITY MESSAGE
      ===================================================== */}

      <div className="
        mt-5
        flex
        items-center
        justify-center
        gap-2
        text-xs
        text-slate-400
      ">
        <LockKeyhole size={13} />
        Secure authentication powered by Clerk
      </div>

    </div>
  )
}


/* =========================================================
   OAUTH BUTTON
========================================================= */

function OAuthButton({
  provider,
  icon,
  onClick,
  disabled,
}: {
  provider: string
  icon: React.ReactNode
  onClick: () => void
  disabled: boolean
}) {

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="
        flex
        h-12
        items-center
        justify-center
        gap-2.5
        rounded-xl
        border
        border-slate-200
        bg-white
        text-sm
        font-semibold
        text-slate-700
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:border-indigo-200
        hover:bg-indigo-50
        hover:text-indigo-700
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {icon}

      {provider}
    </button>
  )
}


/* =========================================================
   MESSAGE BOX
========================================================= */

function MessageBox({
  type,
  message,
}: {
  type: "error" | "success"
  message: string
}) {

  return (
    <div
      className={`
        rounded-xl
        border
        px-3
        py-2.5
        text-xs
        leading-5
        ${
          type === "error"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }
      `}
    >
      {message}
    </div>
  )
}


/* =========================================================
   GOOGLE ICON
========================================================= */

function GoogleIcon() {

  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.71-.06-1.39-.18-2.04H12v3.86h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.18Z"
      />

      <path
        fill="#34A853"
        d="M12 21.9c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.04H3.27v2.51A9.75 9.75 0 0 0 12 21.9Z"
      />

      <path
        fill="#FBBC05"
        d="M6.51 14c-.2-.58-.31-1.2-.31-1.84s.11-1.26.31-1.84V7.81H3.27A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.02 4.19L6.51 14Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.28c1.43 0 2.72.49 3.74 1.46l2.8-2.8C16.84 3.37 14.63 2.1 12 2.1a9.75 9.75 0 0 0-8.73 5.71L6.51 10.3C7.29 7.98 9.45 6.28 12 6.28Z"
      />
    </svg>
  )
}


/* =========================================================
   ARROW ICON
========================================================= */

function ArrowRightIcon() {

  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
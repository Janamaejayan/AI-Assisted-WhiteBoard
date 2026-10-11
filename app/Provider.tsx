"use client"

import React, {
  useEffect,
  useState,
} from "react"
import axios from "axios"
import {
  ThemeProvider,
  useTheme,
} from "next-themes"
import { UserDetailContext } from "@/context/UserDetailContext"

const ProviderContent = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [userDetail, setUserDetail] =
    useState<any>()

  const { setTheme } = useTheme()

  // --------------------------------------------------
  // Create / fetch user and load saved settings
  // --------------------------------------------------

  useEffect(() => {
    CreateNewUser()
  }, [])

  const CreateNewUser = async () => {
    try {
      const result = await axios.post("/api/users")

      console.log(result.data)

      // Save user information in context
      setUserDetail(result.data)

      // --------------------------------------------------
      // Load settings from DB
      // --------------------------------------------------

      try {
        const settingsResponse = await axios.get(
          "/api/settings"
        )

        const dbSettings =
          settingsResponse.data?.settings

        if (dbSettings?.theme) {
          setTheme(dbSettings.theme)
        }
      } catch (settingsError) {
        console.error(
          "Failed to load settings:",
          settingsError
        )
      }
    } catch (error) {
      console.error(
        "Failed to create/fetch user:",
        error
      )
    }
  }

  return (
    <UserDetailContext.Provider
      value={{
        userDetail,
        setUserDetail,
      }}
    >
      <div>{children}</div>
    </UserDetailContext.Provider>
  )
}

const Provider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProviderContent>
        {children}
      </ProviderContent>
    </ThemeProvider>
  )
}

export default Provider
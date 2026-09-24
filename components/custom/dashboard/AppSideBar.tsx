"use client"

import { useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { useUser } from "@clerk/nextjs"

import {
  Archive,
  LayoutGrid,
  Settings,
  Sparkles,
  Users2Icon,
} from "lucide-react"

import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

import defaultImg from "../../../public/logo.svg"

import CreateNewBoardDialogue from "./CreateNewBoardDialogue"
import SettingsPanel from "@/components/custom/dashboard/SettingsPanel"
import { Progress } from "@/components/ui/progress"


export function AppSidebar() {

  const path = usePathname()
  const router = useRouter()

  const { user } = useUser()

  const [settingsOpen, setSettingsOpen] =
    useState(false)


  return (
    <Sidebar>

      {/* ================= HEADER ================= */}

      <SidebarHeader>

        <div className="flex items-center gap-2 p-4">

          <Image
            src="/logo.svg"
            alt="Logo"
            width={40}
            height={40}
          />

          <h2 className="text-xl font-bold">
            WhizBoard
          </h2>

        </div>

      </SidebarHeader>


      {/* ================= CONTENT ================= */}

      <SidebarContent>

        <SidebarGroup>

          <CreateNewBoardDialogue />

          <SidebarGroupLabel className="mt-5">
            <h1>My boards</h1>
          </SidebarGroupLabel>


          {/* ALL FILES */}

          <SidebarMenuButton
            className="p-5 mt-2"
            isActive={path === "/dashboard"}
            onClick={() =>
              router.push("/dashboard")
            }
          >

            <LayoutGrid />

            <span>
              All Files
            </span>

          </SidebarMenuButton>


          {/* SHARED */}

          <SidebarMenuButton
            className="p-5 mt-2"
            isActive={path === "/shared-files"}
            onClick={() =>
              router.push("/shared-files")
            }
          >

            <Users2Icon />

            <span>
              Shared
            </span>

          </SidebarMenuButton>


          {/* ARCHIVE */}

          <SidebarMenuButton
            className="p-5 mt-2"
            isActive={path === "/archived"}
            onClick={() =>
              router.push("/archived")
            }
          >

            <Archive />

            <span>
              Archive
            </span>

          </SidebarMenuButton>

        </SidebarGroup>


        {/* ================= OTHERS ================= */}

        <SidebarGroup>

          <SidebarGroupLabel className="mt-5">
            <h1>Others</h1>
          </SidebarGroupLabel>


          {/* AI HELPER */}

          <SidebarMenuButton
            className="p-5"
            isActive={path === "/AI"}
            onClick={() =>
              router.push("/AI")
            }
          >

            <Sparkles />

            <span>
              AI Helper
            </span>

          </SidebarMenuButton>


          {/* SETTINGS */}

          <SidebarMenuButton
            className="p-5"
            isActive={settingsOpen}
            onClick={() =>
              setSettingsOpen((prev) => !prev)
            }
          >

            <Settings
              className={
                settingsOpen
                  ? "rotate-45 transition-transform"
                  : "transition-transform"
              }
            />

            <span>
              Settings
            </span>

          </SidebarMenuButton>

        </SidebarGroup>

      </SidebarContent>


      {/* ================= FOOTER ================= */}

      <SidebarFooter>

        <CreateNewBoardDialogue />


        {/* STORAGE */}

        <div className="p-4 my-3 border rounded-md">

          <h2 className="text-sm flex justify-between mb-1">

            <span>
              2 Files Created
            </span>

            <span>
              total 3
            </span>

          </h2>

          <Progress
            value={66}
            className="h-2 mt-2"
          />

        </div>


        {/* USER */}

        <div className="flex items-center gap-2 p-4 border rounded-md">

          <Image
            src={
              user?.imageUrl ??
              defaultImg
            }
            alt="User Image"
            width={40}
            height={40}
            className="rounded-full"
          />

          <div className="min-w-0">

            <h2 className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </h2>

            <p className="text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>

          </div>

        </div>

      </SidebarFooter>


      {/* ================= SETTINGS PANEL ================= */}

      <SettingsPanel
        open={settingsOpen}
        onClose={() =>
          setSettingsOpen(false)
        }
      />

    </Sidebar>
  )
}
"use client"

import { useContext, useEffect, useState } from "react"
import axios from "axios"
import { UserDetailContext } from "@/context/UserDetailContext"

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
  const { userDetail } = useContext(UserDetailContext)

  const [settingsOpen, setSettingsOpen] =
    useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [fileSummary, setFileSummary] = useState<{
    count: number
    total: number | null
  } | null>(null)

  useEffect(() => {
    if (!userDetail?.id) return

    let active = true
    const loadSummary = async () => {
      try {
        const { data } = await axios.get<{
          count: number
          total: number | null
        }>("/api/projects?summary=true")
        if (active) setFileSummary(data)
      } catch (error) {
        console.error("Failed to load file count:", error)
      }
    }

    loadSummary()
    window.addEventListener("projects:changed", loadSummary)

    return () => {
      active = false
      window.removeEventListener("projects:changed", loadSummary)
    }
  }, [userDetail?.id, path])


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
            isActive={aiDialogOpen}
            onClick={() => setAiDialogOpen(true)}
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
        {/* STORAGE */}

        <div className="my-2 rounded-xl border bg-sidebar-accent/30 p-4">

          <h2 className="mb-1 flex justify-between gap-2 text-xs font-medium text-sidebar-foreground">

            <span>
              Boards used
            </span>

            <span>
              {fileSummary?.count ?? "—"} / {fileSummary?.total ?? "—"}
            </span>

          </h2>

          <Progress
            value={fileSummary?.total && fileSummary.total > 0
              ? Math.min(100, (fileSummary.count / fileSummary.total) * 100)
              : 0}
            className="h-2 mt-2"
          />

        </div>


        {/* USER */}

        <div className="flex items-center gap-3 rounded-xl border p-3">

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

      <CreateNewBoardDialogue
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        openAiOnCreate
        hideTrigger
      />

    </Sidebar>
  )
}

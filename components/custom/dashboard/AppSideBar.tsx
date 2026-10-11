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

import { useClerk, useUser } from "@clerk/nextjs"

import {
  Archive,
  LayoutGrid,
  LogOut,
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
  const { signOut } = useClerk()
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

        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-3 py-5">

          <Image
            src="/logo.svg"
            alt="Logo"
            width={31}
            height={31}
          />

          <h2 className="text-[17px] font-semibold tracking-tight">
            WhizBoard
          </h2>

        </div>

      </SidebarHeader>


      {/* ================= CONTENT ================= */}

      <SidebarContent>

        <SidebarGroup>

          <CreateNewBoardDialogue />

          <SidebarGroupLabel className="mt-7 text-[11px] font-semibold uppercase tracking-[0.13em]">
            <h1>Workspace</h1>
          </SidebarGroupLabel>


          {/* ALL FILES */}

          <SidebarMenuButton
            className="mt-1 h-10 rounded-md px-3 text-sm"
            isActive={path === "/dashboard"}
            onClick={() =>
              router.push("/dashboard")
            }
          >

            <LayoutGrid />

            <span>
              All boards
            </span>

          </SidebarMenuButton>


          {/* SHARED */}

          <SidebarMenuButton
            className="mt-1 h-10 rounded-md px-3 text-sm"
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
            className="mt-1 h-10 rounded-md px-3 text-sm"
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

          <SidebarGroupLabel className="mt-5 text-[11px] font-semibold uppercase tracking-[0.13em]">
            <h1>Tools</h1>
          </SidebarGroupLabel>


          {/* AI HELPER */}

          <SidebarMenuButton
            className="h-10 rounded-md px-3 text-sm"
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
            className="h-10 rounded-md px-3 text-sm"
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

        <div className="my-2 border-t border-sidebar-border px-2 py-4">

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
            className="mt-3 h-1"
          />

        </div>


        {/* USER */}

        <div className="flex items-center gap-3 border-t border-sidebar-border px-2 py-4">

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

        <SidebarMenuButton
          className="h-10 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          <LogOut />
          <span>Log out</span>
        </SidebarMenuButton>

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

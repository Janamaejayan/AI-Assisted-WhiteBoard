"use client"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
import { Archive, Files, LayoutGrid, Settings, Sparkle, Sparkles, UserRound, Users2Icon } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function AppSidebar() {

    const path = usePathname();
    const {user} = useUser();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-4">
           <Image src={"/logo.svg"} alt = "Logo" width={40} height={40}  />
           <h2 className="text-xl font-bold">WhizBoard</h2>
        </div>
      </ SidebarHeader>
      <SidebarContent>
        <SidebarGroup> 
            <Button> + Create New Board</Button>
            <SidebarGroupLabel className="mt-5"> <h1>My boards</h1></SidebarGroupLabel>
            <SidebarMenuButton className="p-5 mt-2" isActive = {path === "/dashboard"}>
                <LayoutGrid />
                <span>All Files</span>
            </SidebarMenuButton>

            <SidebarMenuButton className="p-5 mt-2" isActive = {path === "/shared-files"}>
                <Users2Icon />
                <span>Shared </span>
            </SidebarMenuButton>

            <SidebarMenuButton className="p-5 mt-2" isActive = {path === "/archived"}>
                <Archive />
                <span>Archive </span>
            </SidebarMenuButton>
        </SidebarGroup>
        <SidebarGroup > 
                <SidebarGroupLabel className="mt-5"> <h1>Others</h1></SidebarGroupLabel>
            <SidebarMenuButton className="p-5" isActive = {path === "/AI"}>
                <Sparkles />
                <span>AI Helper </span>
            </SidebarMenuButton>

            <SidebarMenuButton className="p-5" isActive = {path === "/settings"}>
                <Settings />
                <span>Settings </span>
            </SidebarMenuButton>
        </SidebarGroup >
      </SidebarContent>
      <SidebarFooter> 
        <Button>+ Create New Board</Button>
        <div className="p-4 my-3 border rounded-md">
            <h2 className="text-sm flex justify-between mb-1">2 Files Created <span>total 3</span></h2>
            <Progress value = {66} className = "h-2 mt-2"/>
        </div>

        <div className="flex items-center gap-2 p-4 border rounded-md">
            <Image src={user?.imageUrl ?? ''} alt="User Image" width={40} height={40} className="rounded-full"/>
            <h2>{user?.firstName} {user?.lastName}</h2>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
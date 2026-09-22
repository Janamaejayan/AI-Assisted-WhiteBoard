import { AppSidebar } from "@/components/custom/dashboard/AppSideBar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
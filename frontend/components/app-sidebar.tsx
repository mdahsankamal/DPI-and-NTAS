"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Activity,
  Layers3,
  LayoutDashboard,
  Network,
  PackageSearch,
  ShieldAlert,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  {
    title: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Packets",
    href: "/packets",
    icon: PackageSearch,
  },
  {
    title: "Connections",
    href: "/connections",
    icon: Network,
  },
  {
    title: "Protocols",
    href: "/protocols",
    icon: Layers3,
  },

  {
    title: "Traffic",
    href: "/traffic",
    icon: Activity,
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: ShieldAlert,
  },
]

export function AppSideBar() {
  const currentPathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-start border-b px-4 py-4">
        <LayoutDashboard />{" "}
        <span className="group-data-[collapsible=icon]:hidden">
          DPI Dashboard
        </span>
      </SidebarHeader>
      <SidebarContent className="mt-2 pr-4">
        <SidebarMenu>
          {items.map((item, index) => {
            const MyIcon = item.icon
            return (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton
                  asChild
                  className={`mx-2 my-1.5 hover:bg-zinc-800 data-[active=true]:bg-blue-800`}
                  isActive={currentPathname === item.href}
                >
                  <Link href={item.href}>
                    <MyIcon />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex h-12 flex-row items-center font-bold group-data-[collapsible=icon]:hidden">
        PCAP UPLOAD READY
      </SidebarFooter>
    </Sidebar>
  )
}

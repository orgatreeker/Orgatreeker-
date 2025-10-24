"use client"

import * as React from "react"
import { LayoutDashboard, Wallet, PiggyBank, Settings, ChevronUp, User2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignedIn, UserButton, useUser } from "@clerk/nextjs"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Income",
    url: "income",
    icon: Wallet,
  },
  {
    title: "Budget",
    url: "budget",
    icon: PiggyBank,
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
  },
]

export function AppSidebar({ activeTab, onTabChange, ...props }: AppSidebarProps) {
  const { user } = useUser()

  const getUserName = () => {
    if (!user) return "Guest"
    return user.firstName || user.fullName || user.username || "User"
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">FT</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Hi, {getUserName()} 👋</span>
                  <span className="truncate text-xs text-muted-foreground">Personal Finance</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => onTabChange(item.url)}
                    isActive={activeTab === item.url}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignedIn>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <User2 className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.firstName || user?.username || "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress || ""}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem asChild>
                    <div className="flex items-center gap-2 p-2">
                      <UserButton afterSignOutUrl="/" />
                      <span className="text-sm">Manage Account</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

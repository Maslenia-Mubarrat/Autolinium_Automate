"use client"

import { Home, Users, Calendar, CheckSquare, ClipboardList, LogOut } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,

} from "@/components/ui/sidebar"

const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: Home,
    },
    {
        title: "Attendance",
        url: "/attendance",
        icon: Users,
    },
    {
        title: "Meetings",
        url: "/meetings",
        icon: Calendar,
    },
    {
        title: "Tasks",
        url: "/tasks",
        icon: CheckSquare,
    },
    {
        title: "Weekly Reports",
        url: "/reports",
        icon: ClipboardList,
    }
]

export function AppSidebar() {
    return (
        <Sidebar className="sidebar-root border-r-2 border-primary bg-white">
            <SidebarHeader className="sidebar-header-section border-b-2 border-primary p-4">
                <div className="logo-container flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary rounded-none flex items-center justify-center">
                        <span className="text-white font-black text-xl font-mono">  A</span>
                    </div>
                    <span className="font-black text-lg tracking-tighter text-primary
                     font-mono whitespace-nowrap uppercase">
                        Autolinium
                    </span>
                </div>
            </SidebarHeader>
            <SidebarContent className="sidebar-main-content">
                <SidebarGroup className="nav-group">
                    <SidebarGroupLabel className="nav-label text-[10px] uppercase font-bold text-slate-400 font-mono">
                        System_Console
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                items.map(
                                    (item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild
                                                className="hover: bg-primary/10 rounded-none transition-none
                                        border-l-2 border-transparent hover:border-primary group"
                                            >
                                                <a href={item.url}
                                                    className="flex items-center gap-3">
                                                    <item.icon className="text-primary w-4 h-4" />
                                                    <span className="font-bold text-sm uppercase font-mono">{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                )
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="sidebar-footer-info border-t-2 border-primary p-4 text-slate-400">
                <span className="version-tag font-mono text-[10px] upprcase font-bold tracking-tighter">
                    Ver_1.0// Auth_Ready
                </span>
            </SidebarFooter>
        </Sidebar>




    )
}
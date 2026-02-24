"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { MobileNav } from "./MobileNav"
import { useIsMobile } from "@/hooks/use-mobile"

export function AppShell({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile()

    return (
        <SidebarProvider className="sidebar-state-context">
            <div className="app-shell-root flex min-h-screen w-full bg-white font-mono">
                {/* Only show the Sidebar if we are on Desktop */}
                {!isMobile && <AppSidebar />}

                <main className="main-content-wrapper flex-1 flex flex-col min-w-0">
                    {/* A professional top header shared by everyone */}
                    <header className="app-header-top h-14 border-b-2 border-primary flex items-center px-4 justify-between bg-white sticky top-0 z-40">
                        <div className="flex items-center gap-2">
                            {!isMobile && <SidebarTrigger className="text-primary hover:bg-primary/10 rounded-none h-8 w-8 transition-none" />}
                            <span className="font-bold text-primary tracking-tighter uppercase text-sm font-mono">
                                Autolinium // {isMobile ? 'Mobile_Control' : 'Admin_Panel'}
                            </span>
                        </div>

                        <div className="sync-status-indicator flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-200">
                            <div className="pulse-dot h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="status-text text-[10px] uppercase font-bold text-slate-500 font-mono tracking-tighter">
                                Sync_Live
                            </span>
                        </div>
                    </header>

                    {/* This is where your page content will appear */}
                    <section className="page-content-viewport flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
                        <div className="content-constrain max-w-7xl mx-auto">
                            {children}
                        </div>
                    </section>

                    {/* Only show the Bottom Nav if we are on Mobile */}
                    {isMobile && <MobileNav />}
                </main>
            </div>
        </SidebarProvider>
    )
}

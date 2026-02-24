"use client"

import { Home, Clock, Calendar, CheckCircle, User } from "lucide-react"

const navItems = [
    { icon: Home, label: "Home", url: "/" },
    { icon: Clock, label: "Timer", url: "/attendance" },
    { icon: Calendar, label: "Docs", url: "/meetings" },
    { icon: CheckCircle, label: "Tasks", url: "/tasks" },
    { icon: User, label: "Me", url: "/profile" },
]

export function MobileNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t-4 border-primary grid grid-cols-5 items-center px-2 z-50">
            {navItems.map((item) => (
                <a
                    key={item.label}
                    href={item.url}
                    className="flex flex-col items-center justify-center gap-1 active:bg-primary/10 h-full transition-colors group"
                >
                    <item.icon className="w-5 h-5 text-primary group-active:scale-95 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-tighter text-slate-600 font-mono">
                        {item.label}
                    </span>
                </a>
            ))}
        </nav>
    )
}

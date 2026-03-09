"use client"

import { useState, useEffect } from "react";
import { AdminCommandBoard } from "@/components/dashboard/AdminCommandBoard";
import { GlobalMeetingLog } from "@/components/meetings/GlobalMeetingLog";
import { ShieldAlert } from "lucide-react";

export default function MeetingsPage() {
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setUserRole(JSON.parse(userStr).role);
        }
    }, []);

    if (userRole !== "ADMIN") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] border-4 border-dashed border-slate-100">
                <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
                <h1 className="font-mono font-black uppercase text-slate-300">Section_Restricted // Admin_Only</h1>
            </div>
        )
    }

    return (
        <div className="meeting-hub-container space-y-8">
            <div className="header-section">
                <h1 className="text-3xl font-black text-primary uppercase font-mono tracking-tighter">
                    Management // Meeting_Hub
                </h1>
                <p className="text-slate-400 font-mono text-xs uppercase font-bold mt-1">
                    Centralized Control for Internal Syncs and Client Sessions
                </p>
            </div>

            {/* 1. The Scheduling Controls */}
            <AdminCommandBoard />

            {/* 2. The Global Oversight Table */}
            <GlobalMeetingLog />
        </div>
    );
}

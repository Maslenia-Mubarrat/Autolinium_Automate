"use client"

import { useState, useEffect } from "react";
import { AttendanceCard } from "@/components/dashboard/AttendanceCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LeaveRequestCard } from "@/components/dashboard/LeaveRequestCard";
import { TaskBoard } from "@/components/dashboard/TaskBoard";
import { MeetingCard } from "@/components/dashboard/MeetingCard";

export default function Home() {
  // 1. We define the "userRole" variable here. 
  // This is why the red line will disappear!
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);

      // 2. We take the value from ".role" (from your Prisma Schema)
      // and save it in our local variable.
      setUserRole(user.role);
    }
  }, []);

  return (
    <div className="dashboard-root-container">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary uppercase font-mono tracking-tighter">
          Dashboard // Overview
        </h1>
      </div>

      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">



        <AttendanceCard />
        <KpiCard />
        <TaskBoard />
        <LeaveRequestCard />
        <MeetingCard />

        <div className="placeholder-slot border-2 border-dashed border-slate-200 h-[350px] flex flex-col items-center justify-center p-6 bg-slate-50/50">
          <div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-none mb-4" />
          <span className="font-mono text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center">
            Future_Module_Slot // KPI_Engine_Next
          </span>
        </div>
      </div>
    </div>
  );
}

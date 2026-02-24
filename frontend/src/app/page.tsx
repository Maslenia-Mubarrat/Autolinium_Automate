import { AttendanceCard } from "@/components/dashboard/AttendanceCard";

export default function Home() {
  return (
    <div className="dashboard-root-container">
      {/* 1. Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary uppercase font-mono tracking-tighter">
          Dashboard // Overview
        </h1>
        <p className="text-slate-500 font-mono text-xs uppercase font-bold">
          System_Status: Online
        </p>
      </div>

      {/* 2. The Grid System (Responsive Layout) */}
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* OUR NEW ATTENDANCE CARD */}
        <AttendanceCard />

        {/* Empty Slots for Tomorrow (Day 3 & 4) */}
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

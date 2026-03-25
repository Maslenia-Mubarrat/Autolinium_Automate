"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, ArrowLeft, Activity } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api";

export default function KpiPage() {
    const [kpiData, setKpiData] = useState<{
        kpi1Attendance: number,
        kpi2Timeliness: number,
        kpi3InternalMeetings: number,
        kpi4ClientMeetings: number,
        kpi5PeerReview: number,
        totalSoFar: number,
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchKpiStatus = async () => {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            try {
                // Fetching via dynamic API_URL
                const response = await fetch(`${API_URL}/api/kpi/status/${user.id}`);
                const result = await response.json();
                if (response.ok) setKpiData(result);
            } catch (error) {
                console.error("failed to fetch KPI status:", error);
            } finally { setIsLoading(false); }
        };
        fetchKpiStatus();
    }, [])

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono font-bold text-slate-400 animate-pulse uppercase tracking-widest">Loading_KPI_Engine...</div>
    }

    if (!kpiData) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono font-bold text-red-400 uppercase tracking-widest">KPI_Engine_Offline</div>
    }

    // Dynamic percent calculations
    const kpis = [
        { id: 1, name: "Attendance", score: kpiData.kpi1Attendance, max: 10 },
        { id: 2, name: "Timeliness", score: kpiData.kpi2Timeliness, max: 10 },
        { id: 3, name: "Internal Meetings", score: kpiData.kpi3InternalMeetings, max: 10 },
        { id: 4, name: "Client Meetings", score: kpiData.kpi4ClientMeetings, max: 10 },
        { id: 5, name: "Peer Review", score: kpiData.kpi5PeerReview, max: 10 },
        { id: 6, name: "Deadlines", score: 0, max: 10 },
        { id: 7, name: "Weekly Report", score: 0, max: 10 },
        { id: 8, name: "Value Added", score: 0, max: 25 },
        { id: 9, name: "Innovation", score: 0, max: 5 },
    ]

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-6">
                    <div className="space-y-1">
                        <Link href="/dashboard" className="text-[10px] font-mono font-bold text-slate-400 hover:text-primary uppercase tracking-widest flex items-center gap-1 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Back_To_Command_Center
                        </Link>
                        <h1 className="text-3xl font-black font-mono tracking-tighter text-slate-800 flex items-center gap-3">
                            <Target className="w-8 h-8 text-primary" />
                            PERFORMANCE_METRICS
                        </h1>
                        <p className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase">
                            Monthly Cycle Details
                        </p>
                    </div>

                    {/* Master Score Display */}
                    <div className="bg-white border-2 border-slate-200 p-4 shrink-0 text-right">
                        <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">
                            Running_Total_Score
                        </div>
                        <div className="flex items-baseline justify-end gap-2">
                            <div className="text-4xl font-black font-mono text-primary tabular-nums">
                                {kpiData.totalSoFar.toFixed(1)}
                            </div>
                            <div className="text-xs font-bold text-slate-400 font-mono tracking-widest">/ 100.0</div>
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kpis.map((kpi) => {
                        const isPending = kpi.score === 0 && kpi.id > 5; // Temporary logic until we build them
                        const percent = (kpi.score / kpi.max) * 100;

                        return (
                            <div key={kpi.id} className={`bg-white border-2 p-5 flex flex-col justify-between h-[180px] transition-colors ${isPending ? 'border-dashed border-slate-200 opacity-60' : 'border-slate-200 hover:border-primary'}`}>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className={`text-[9px] rounded-none ${isPending ? 'text-slate-400 border-slate-200' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                            KPI_{kpi.id}
                                        </Badge>
                                        <div className="text-right">
                                            <div className="text-2xl font-black font-mono tabular-nums text-slate-800">
                                                {kpi.score.toFixed(1)}
                                            </div>
                                            <div className="text-[9px] font-bold font-mono text-slate-400 tracking-widest">
                                                / {kpi.max}.0 MAX
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold font-mono text-slate-600 tracking-tight">
                                        {kpi.name}
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <Progress value={percent} className="h-1.5 rounded-none bg-slate-100" />
                                    {isPending && (
                                        <div className="text-[9px] font-bold font-mono text-slate-400 tracking-widest text-right uppercase">
                                            AWAITING_DATA...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

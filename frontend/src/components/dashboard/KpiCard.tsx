"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Activity, AlertCircle } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api";

export function KpiCard() {
    const [kpiData, setKpiData] = useState<{
        totalSoFar: number,
        totalDaysLogged: number;
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

                if (response.ok) {
                    setKpiData(result)
                }
            } catch (error) {
                console.error("failed to fetch KPI status:", error);
            } finally { setIsLoading(false); }
        };

        fetchKpiStatus();
    }, [])

    if (isLoading) {
        return (
            <Card className="rounded-none border-2 border-slate-200 shadow-none bg-slate-50/50 flex items-center justify-center p-6 h-[350px]">
                <div className="font-mono text-sm uppercase text-slate-400 font-bold tracking-widest flex items-center gap-2 animate-pulse">
                    <Activity className="w-4 h-4" />
                    Calculating_Live_KPIs...
                </div>
            </Card>
        )
    }
    if (!kpiData) {
        return (
            <Card className="rounded-none border-2 border-slate-200 shadow-none bg-white flex items-center justify-center p-6 h-[350px]">
                <div className="font-mono text-xs uppercase text-slate-400 font-bold tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    KPI_Engine_Offline
                </div>
            </Card>
        )
    }

    return (
        <Card className="rounded-none border-2 border-slate-200 shadow-none hover:border-primary transition-colors bg-white h-[350px] flex flex-col relative group">
            <Link href="/kpi" className="absolute inset-0 z-10" />
            <CardHeader className="border-b-2 border-slate-100 pb-4 shrink-0">
                <CardTitle className="font-mono text-sm tracking-widest text-slate-500 uppercase font-bold flex justify-between items-center pr-2">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Total_KPI_Score
                    </div>
                    <Badge variant="outline" className="text-[9px] rounded-none group-hover:bg-primary group-hover:text-white transition-colors">
                        VIEW_DETAILS
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col justify-center items-center text-center">

                <div className="text-[10px] tracking-widest font-mono text-slate-400 uppercase mb-4 font-bold">
                    Running Total (KPI 1-9)
                </div>

                {/* Master Score Display */}
                <div className="flex items-baseline gap-2">
                    <div className="text-7xl font-black font-mono tracking-tighter text-slate-800 tabular-nums">
                        {kpiData.totalSoFar.toFixed(1)}
                    </div>
                    <div className="text-sm font-bold text-slate-400 font-mono tracking-widest">/ 100.0</div>
                </div>

                {/* Footer Metadata */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center border-t-2 border-dashed border-slate-100 pt-4">
                    <div className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-tighter flex items-center gap-1">
                        <Activity className="w-3 h-3 text-primary animate-pulse" />
                        Scanning: {kpiData.totalDaysLogged} Records
                    </div>
                    <div className="text-[9px] text-primary font-mono font-black tracking-widest">
                        MONTHLY_CYCLE
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

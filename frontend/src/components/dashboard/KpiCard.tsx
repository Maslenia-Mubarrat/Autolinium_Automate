"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Activity, AlertCircle } from "lucide-react"

export function KpiCard() {
    const [kpiData, setKpiData] = useState<{
        kpi1Attendance: number, kpi2Timeliness: number,
        totalDaysLogged: number;
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
        const fetchKpiStatus = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/kpi/status/1');
                const result = await response.json();

                if (response.ok) {
                    setKpiData(result)
                }


            }
            catch (error) {
                console.error("failed to fetch KPI status:", error);

            }
            finally { setIsLoading(false); }

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

    // percentage hishab
    const kpi1Percent = (kpiData.kpi1Attendance / 10) * 100;
    const kpi2Percent = (kpiData.kpi2Timeliness / 10) * 100;
    //average KPI for dashboard (will be changed later with other KPI's)
    const averageScore = ((kpiData.kpi1Attendance + kpiData.kpi2Timeliness) / 2).toFixed(1);
    return (
        <Card className="rounded-none border-2 border-slate-200 shadow-none hover:border-primary transition-colors bg-white h-[350px] flex flex-col">
            <CardHeader className="border-b-2 border-slate-100 pb-4 shrink-0">
                <CardTitle className="font-mono text-sm tracking-widest text-slate-500 uppercase font-bold flex justify-between items-center pr-2">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Live_Metrics
                    </div>
                    <Badge variant="outline" className="text-[9px] rounded-none">
                        AUTO_CALC
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col justify-between">

                {/* Master Score Display */}
                <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-black font-mono tracking-tighter text-slate-800 tabular-nums">
                        {averageScore}
                    </div>
                    <div className="text-xs font-bold text-slate-400 font-mono tracking-widest">/ 10 AVG</div>
                </div>
                <div className="space-y-6 mt-4">
                    {/* KPI 1: Attendance */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                                KPI_1: Attendance
                            </span>
                            <span className="text-xs font-black font-mono text-slate-800">
                                {kpiData.kpi1Attendance.toFixed(1)} <span className="text-slate-400 font-normal">/ 10</span>
                            </span>
                        </div>
                        <Progress value={kpi1Percent} className="h-2 rounded-none bg-slate-100" />
                    </div>
                    {/* KPI 2: Timeliness */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                                KPI_2: Timeliness
                            </span>
                            <span className="text-xs font-black font-mono text-slate-800">
                                {kpiData.kpi2Timeliness.toFixed(2)} <span className="text-slate-400 font-normal">/ 10</span>
                            </span>
                        </div>
                        <Progress value={kpi2Percent} className="h-2 rounded-none bg-slate-100" />
                    </div>
                </div>
                {/* Footer Metadata */}
                <div className="mt-4 flex justify-between items-center border-t-2 border-dashed border-slate-100 pt-4 shrink-0">
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





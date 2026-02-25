"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Fingerprint, AlertCircle } from "lucide-react"

export function AttendanceCard() {
    // 1. Reactive State: The 'time' state triggers a re-render every second
    const [time, setTime] = useState(new Date())
    const [status, setStatus] = useState<"idle" | "present" | "late">("idle")

    // 2. Side-Effect: Creating a 1000ms heartbeat
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date())
        }, 1000)

        // Destructor: Always clear the interval to prevent memory leaks
        return () => clearInterval(timer)
    }, [])

    const hours = time.getHours()
    const minutes = time.getMinutes()
    const isPastEleven = hours > 11 || (hours === 11 && minutes > 0)

    const handleCheckIn = () => {
        setStatus(isPastEleven ? "late" : "present")
        console.log("Check-in triggered at:", time.toLocaleTimeString())
    }

    return (
        <Card className="attendance-card-root border-2 
        border-primary rounded-none shadow-none 
        bg-white overflow-hidden">
            <CardHeader className="attendance-header border-b-2 border-primary bg-slate-50 flex flex-row items-center justify-between py-3">
                <CardTitle className="card-title-text text-sm font-black uppercase tracking-tighter font-mono flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-primary" />
                    Attendance_Console
                </CardTitle>
                <div className="status-badge-wrapper flex items-center gap-2">
                    {status === "late" && (
                        <Badge variant="destructive" className="status-badge rounded-none font-mono text-[10px] uppercase">
                            Status: Late
                        </Badge>
                    )}
                    {status === "present" && (
                        <Badge className="status-badge bg-green-600 hover:bg-green-700 rounded-none font-mono text-[10px] uppercase text-white">
                            Status: On_Time
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="attendance-body p-6">
                <div className="content-layout flex flex-col items-center justify-center space-y-6">
                    <div className="clock-section text-center">
                        <div className="label-wrapper flex items-center justify-center gap-2 text-slate-400 mb-1">
                            <Clock className="w-3 h-3" />
                            <span className="label-text text-[10px] uppercase font-bold font-mono tracking-widest">Server_Time</span>
                        </div>
                        <h2 className="digital-clock-text text-5xl font-black text-primary font-mono tracking-tighter">
                            {time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </h2>
                    </div>

                    {isPastEleven && status === "idle" && (
                        <div className="warning-banner border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-3 w-full">
                            <AlertCircle className="warning-icon text-destructive w-5 h-5 flex-shrink-0" />
                            <p className="warning-message text-[11px] font-mono leading-tight text-destructive uppercase font-bold">
                                Warning: Current time exceeds 09:00 AM limit. Points deduction active.
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={handleCheckIn}
                        disabled={status !== "idle"}
                        className={`action-button-main w-full h-14 rounded-none font-black text-lg uppercase font-mono tracking-tight transition-all
                            ${status === "idle" ? 'hover:bg-primary/90' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}
                    >
                        {status === "idle" ? "Initiate_Check_In" : "Check_In_Logged"}
                    </Button>

                    <div className="footer-meta text-[9px] text-slate-400 font-mono uppercase font-bold tracking-tighter">
                        Log_ID: {Math.random().toString(36).substring(7).toUpperCase()} // System_Ready
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

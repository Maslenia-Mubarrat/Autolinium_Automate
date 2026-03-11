"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Fingerprint, AlertCircle } from "lucide-react"

export function AttendanceCard() {
    // 1. Reactive State
    const [time, setTime] = useState(new Date())
    const [status, setStatus] = useState<"syncing" | "idle" | "present" | "late" | "done">("syncing")
    const [isLoading, setIsLoading] = useState(false);
    const [entryTime, setEntryTime] = useState<Date | null>(null);
    const [exitTime, setExitTime] = useState<Date | null>(null);
    const [isHomeOffice, setIsHomeOffice] = useState(false);


    // 2. Heartbeat (1000ms)
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // 3. Status Recall (Verify if already checked in/out today)
    const checkStatus = async () => {

        //first thing to do - getting the logged-in user from storage
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            //second thing- we will now use user.id
            const response = await fetch(`https://autolinium-automate-vgk4.vercel.app/api/attendance/status/${user.id}`);
            const result = await response.json();

            if (result.checkedIn) {
                const fetchedEntry = new Date(result.data.entryTime);
                setEntryTime(fetchedEntry);

                if (result.data.exitTime) {
                    setExitTime(new Date(result.data.exitTime));
                    setStatus("done");
                } else {
                    const hours = fetchedEntry.getHours();
                    const isLate = hours > 11 || (hours === 11 && fetchedEntry.getMinutes() > 0);
                    setStatus(isLate ? "late" : "present");
                }
            } else {
                setStatus("idle");
            }
        } catch (error) {
            console.error("failed to sync attendance status:", error);
            setStatus("idle");
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    // Calculate live session duration (entry to now, or entry to exit)
    let durationStr = "0h 0m";
    if (entryTime) {
        const end = exitTime || time;
        const diffMs = end.getTime() - entryTime.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        durationStr = `${hrs}h ${mins}m`;
    }

    const handleCheckIn = async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr)
            return;
        const user = JSON.parse(userStr);
        setIsLoading(true);
        try {
            const response = await fetch('https://autolinium-automate-vgk4.vercel.app/api/attendance/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    locationMode: isHomeOffice ? 'HOME' : 'OFFICE'
                })

            });
            if (response.ok) {
                await checkStatus();
            }
        } catch (error) {
            console.error("Check-in error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckOut = async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr)
            return;
        const user = JSON.parse(userStr);
        setIsLoading(true);
        try {
            const response = await fetch('https://autolinium-automate-vgk4.vercel.app/api/attendance/check-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            if (response.ok) {
                await checkStatus();
            }
        } catch (error) {
            console.error("Check-out error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const hours = time.getHours()
    const minutes = time.getMinutes()
    const isPastEleven = hours > 11 || (hours === 11 && minutes > 0)

    return (
        <Card className="attendance-card-root border-2 border-primary rounded-none shadow-none bg-white overflow-hidden">
            <CardHeader className="attendance-header border-b-2 border-primary bg-slate-50 flex flex-row items-center justify-between py-3">
                <CardTitle className="card-title-text text-sm font-black uppercase tracking-tighter font-mono flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-primary" />
                    Attendance_Console
                </CardTitle>
                <div className="status-badge-wrapper flex items-center gap-2">
                    {status === "done" ? (
                        <Badge className="status-badge bg-slate-800 text-white rounded-none font-mono text-[10px] uppercase">
                            Shift: Completed
                        </Badge>
                    ) : status === "late" ? (
                        <Badge variant="destructive" className="status-badge rounded-none font-mono text-[10px] uppercase">
                            Status: Late
                        </Badge>
                    ) : status === "present" ? (
                        <Badge className="status-badge bg-green-600 hover:bg-green-700 rounded-none font-mono text-[10px] uppercase text-white">
                            Status: On_Time
                        </Badge>
                    ) : null}
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

                    {(status === "present" || status === "late" || status === "done") && (
                        <div className="duration-display border-2 border-primary/20 bg-primary/5 p-4 flex flex-col items-center w-full">
                            <span className="text-[10px] font-mono font-black uppercase text-slate-500 mb-1">Work_Duration</span>
                            <span className="text-2xl font-black font-mono text-primary">{durationStr}</span>
                        </div>
                    )}

                    {isPastEleven && status === "idle" && (
                        <div className="warning-banner border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-3 w-full">
                            <AlertCircle className="warning-icon text-destructive w-5 h-5 flex-shrink-0" />
                            <p className="warning-message text-[11px] font-mono leading-tight text-destructive uppercase font-bold text-center">
                                Warning: 11:00 AM Limit Exceeded. Points Deduction Active.
                            </p>
                        </div>
                    )}

                    {status === "idle" && (
                        <>
                            <div className="flex items-center justify-between w-full p-3 border-2 border-slate-100 bg-slate-50 mb-4 transition-all hover:border-primary/30">
                                <span className="text-[10px] font-mono font-black uppercase text-slate-500">Working_From:</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant={!isHomeOffice ? "default" : "outline"}
                                        size="sm"
                                        className="h-7 text-[9px] rounded-none font-bold font-mono"
                                        onClick={() => setIsHomeOffice(false)}
                                    >
                                        🏢_OFFICE
                                    </Button>
                                    <Button
                                        variant={isHomeOffice ? "default" : "outline"}
                                        size="sm"
                                        className="h-7 text-[9px] rounded-none font-bold font-mono"
                                        onClick={() => setIsHomeOffice(true)}
                                    >
                                        🏠_HOME
                                    </Button>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckIn}
                                disabled={isLoading}
                                className="action-button-main w-full h-14 rounded-none font-black text-lg uppercase font-mono tracking-tight hover:bg-primary/90"
                            >
                                {isLoading ? "Processing..." : "Initiate_Check_In"}
                            </Button>
                        </>
                    )}


                    {(status === "present" || status === "late") && (
                        <Button
                            onClick={handleCheckOut}
                            disabled={isLoading}
                            className="action-button-main w-full h-14 rounded-none font-black text-lg uppercase font-mono tracking-tight bg-slate-900 hover:bg-slate-800 text-white"
                        >
                            {isLoading ? "Processing..." : "Initiate_Check_Out"}
                        </Button>
                    )}

                    {status === "done" && (
                        <Button
                            disabled
                            className="action-button-main w-full h-14 rounded-none font-black text-lg uppercase font-mono tracking-tight bg-slate-100 text-slate-400 border-2 border-slate-200"
                        >
                            Session_Closed
                        </Button>
                    )}

                    {status === "syncing" && (
                        <Button disabled className="w-full h-14 rounded-none font-mono text-slate-400 bg-slate-50">
                            Syncing_Console...
                        </Button>
                    )}

                    <div className="footer-meta text-[9px] text-slate-400 font-mono uppercase font-bold tracking-tighter">
                        Log_ID: {Math.random().toString(36).substring(7).toUpperCase()} // System_Ready
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

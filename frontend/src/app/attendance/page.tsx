"use client"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock } from "lucide-react"
import { API_URL } from "@/lib/api";

type AttendanceRecord = {
    id: number
    lateStatus: string
    entryTime: string
    exitTime: string | null
    workMinutes: number | null
    adminOverride: boolean
    user: {
        name: string
        employeeId: string
        email: string
    }
}

type TodayData = {
    date: string
    totalPresent: number
    records: AttendanceRecord[]
}

export default function AttendancePage() {
    const [data, setData] = useState<TodayData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchToday = async () => {
        try {
            const res = await fetch(`${API_URL}/api/attendance/today`)
            const json = await res.json()
            setData(json)
        } catch (err) {
            console.error("failed to fetch attendance:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchToday()
    }, [])

    const handleApproveLate = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/api/attendance/approve-late/${id}`, {
                method: 'PATCH'
            });
            if (response.ok) {
                await fetchToday(); // Refresh the list
            }
        } catch (error) {
            console.error("Failed to approve late:", error)
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-primary uppercase font-mono tracking-tighter">
                    Attendance // Today
                </h1>
                <p className="text-slate-500 font-mono text-xs uppercase font-bold">
                    {loading ? "Syncing..." : `${data?.totalPresent ?? 0} employees checked in`}
                </p>
            </div>
            <Card className="border-2 border-primary rounded-none shadow-none">
                <CardHeader className="border-b-2 border-primary bg-slate-50 py-3">
                    <CardTitle className="text-sm font-black uppercase tracking-tighter font-mono flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Live_Attendance_Log
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    {loading ? (
                        <div className="p-6 text-center font-mono text-xs text-slate-400 uppercase font-bold">
                            Syncing_Data...
                        </div>
                    ) : data?.records.length === 0 ? (
                        <div className="p-6 text-center font-mono text-xs text-slate-400 uppercase font-bold">
                            No_Records_Yet // Office_Not_Started
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="text-left p-4 font-mono text-[10px] uppercase font-bold text-slate-400 min-w-[150px]">Employee</th>
                                    <th className="text-left p-4 font-mono text-[10px] uppercase font-bold text-slate-400">Entry</th>
                                    <th className="text-left p-4 font-mono text-[10px] uppercase font-bold text-slate-400">Exit</th>
                                    <th className="text-left p-4 font-mono text-[10px] uppercase font-bold text-slate-400">Duration</th>
                                    <th className="text-left p-4 font-mono text-[10px] uppercase font-bold text-slate-400">Status</th>
                                    <th className="text-right p-4 font-mono text-[10px] uppercase font-bold text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.records.map((record) => (
                                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-mono text-sm font-bold">{record.user.name}</div>
                                            <div className="font-mono text-[9px] text-slate-400 uppercase">{record.user.employeeId}</div>
                                        </td>
                                        <td className="p-4 font-mono text-xs text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-primary" />
                                                {new Date(record.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-xs text-slate-600">
                                            {record.exitTime ? (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {new Date(record.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 font-bold italic uppercase tracking-tighter">Active...</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-xs font-bold text-slate-500 uppercase">
                                            {record.workMinutes ? `${Math.floor(record.workMinutes / 60)}h ${record.workMinutes % 60}m` : '—'}
                                        </td>
                                        <td className="p-4">
                                            {record.lateStatus === 'TIMELY' ? (
                                                <Badge className={`${record.adminOverride ? 'bg-amber-500' : 'bg-green-600'} rounded-none font-mono text-[10px] uppercase text-white px-2`}>
                                                    {record.adminOverride ? 'Approved' : 'On_Time'}
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="rounded-none font-mono text-[10px] uppercase px-2">
                                                    Late
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {record.lateStatus !== 'TIMELY' && (
                                                <button
                                                    onClick={() => handleApproveLate(record.id)}
                                                    className="bg-primary hover:bg-primary/90 text-white font-mono text-[10px] font-black uppercase px-3 py-1 tracking-tighter border-b-2 border-primary-foreground/20 active:border-b-0 active:translate-y-[1px]"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

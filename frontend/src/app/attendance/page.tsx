"use client"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock } from "lucide-react"


type AttendanceRecord = {
    id: number
    lateStatus: string
    entryTime: string
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

    useEffect(() => {
        const fetchToday = async () => {
            try {
                const res = await
                    fetch('http://localhost:5000/api/attendance/today')
                const json = await res.json()
                setData(json)
            }
            catch (err) {
                console.error("failed to fetch attendance:", err)

            }
            finally {
                setLoading(false)

            }
        }
        fetchToday()

    }, [])

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
                <CardContent className="p-0">
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
                                    <th className="text-left p-4 font-mono text-[10px] uppercase font-bold text-slate-400">Employee</th>
                                    <th className="text-left p-4 font-mono text-[10px] uppercase font-bold text-slate-400">ID</th>
                                    <th className="text-left p-4 font-mono text-[10px] uppercase font-bold text-slate-400">Check-In</th>
                                    <th className="text-left p-4 font-mono text-[10px] uppercase font-bold text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.records.map((record) => (
                                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-mono text-sm font-bold">{record.user.name}</td>
                                        <td className="p-4 font-mono text-xs text-slate-500">{record.user.employeeId}</td>
                                        <td className="p-4 font-mono text-xs text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {record.entryTime
                                                    ? new Date(record.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                                    : '—'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {record.lateStatus === 'TIMELY' ? (
                                                <Badge className="bg-green-600 hover:bg-green-700 rounded-none font-mono text-[10px] uppercase text-white">
                                                    On_Time
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="rounded-none font-mono text-[10px] uppercase">
                                                    Late
                                                </Badge>
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







"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react"

export default function MyAttendancePage() {
    const [history, setHistory] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            const userStr = localStorage.getItem("user")
            if (!userStr) return
            const user = JSON.parse(userStr)

            try {
                // We'll reuse the attendance check route but for all history
                const response = await fetch(`https://autolinium-automate-vgk4.vercel.app/api/attendance/user/${user.id}`)
                const data = await response.json()
                setHistory(data)
            } catch (error) {
                console.error("Failed to fetch history", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchHistory()
    }, [])

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-2xl font-black uppercase tracking-tighter text-primary">My_Attendance_Log</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Personal Monthly History Export</p>
            </header>

            <Card className="rounded-none border-2 border-primary bg-white shadow-none">
                <CardHeader className="border-b-2 border-primary bg-slate-50">
                    <CardTitle className="font-mono text-sm font-black uppercase flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> Monthly_Archive
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-left font-mono">
                        <thead className="bg-slate-100 border-b-2 border-slate-200 text-[10px] uppercase font-black text-slate-500">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Entry</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100 text-xs">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-8 text-center animate-pulse">Syncing_Records...</td></tr>
                            ) : history.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400">NO_RECORDS_FOUND</td></tr>
                            ) : history.map((record: any) => (
                                <tr key={record.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold">{new Date(record.recordDate).toLocaleDateString()}</td>
                                    <td className="p-4">{record.entryTime ? new Date(record.entryTime).toLocaleTimeString() : '--:--'}</td>
                                    <td className="p-4">
                                        <Badge className={`rounded-none text-[9px] ${record.lateStatus === 'TIMELY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {record.lateStatus}
                                        </Badge>
                                    </td>
                                    <td className="p-4 font-black text-primary">{record.presenceStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}

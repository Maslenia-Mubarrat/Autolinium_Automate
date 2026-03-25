"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Palmtree, Check, X, Clock, User } from "lucide-react"
import { API_URL } from "@/lib/api";

interface LeaveRequet {
    id: number;
    startDate: string;
    endDate: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestedAt: string;
    user: {
        name: string;
        employeeId: string;
    }
}

export default function AdminLeavePage() {
    const [leaves, setLeaves] = useState<LeaveRequet[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchLeaves = async () => {
        try {
            const res = await
                fetch(`${API_URL}/api/leave/all`)
            const data = await res.json()
            if (res.ok) setLeaves(data)
        }
        catch (error) {
            console.error("failed to fetch leaves", error)
        }
        finally {
            setIsLoading(false)
        }
    }
    useEffect(() => { fetchLeaves() }, [])

    const handleAction = async (id: number, status: "APPROVED" | "REJECTED") => {
        try {
            const res = await
                fetch(`${API_URL}/api/leave/${id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status })
                })
            if (res.ok) fetchLeaves()
        }
        catch (error) {
            console.error("Action failed", error)

        }
    }
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black uppercase tracking-tighter font-mono text-primary">
                    Leave_Management // Admin
                </h1>
            </div>
            <Card className="rounded-none border-2 border-primary shadow-none bg-white">
                <CardHeader className="border-b-2 border-primary bg-slate-50">
                    <CardTitle className="font-mono text-sm tracking-widest text-slate-500 uppercase font-black flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Pending_Applications
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="p-4 font-mono text-[10px] uppercase font-black text-slate-400">Employee</th>
                                    <th className="p-4 font-mono text-[10px] uppercase font-black text-slate-400">Dates</th>
                                    <th className="p-4 font-mono text-[10px] uppercase font-black text-slate-400 w-1/3">Reason</th>
                                    <th className="p-4 font-mono text-[10px] uppercase font-black text-slate-400">Status</th>
                                    <th className="p-4 font-mono text-[10px] uppercase font-black text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center font-mono text-xs text-slate-400 bg-slate-50/50">
                                            NO_PENDING_REQUESTS_FOUND
                                        </td>
                                    </tr>
                                ) : (
                                    leaves.map((leave) => (
                                        <tr key={leave.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 flex items-center justify-center border border-slate-200">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-mono text-xs font-black uppercase">{leave.user.name}</div>
                                                        <div className="font-mono text-[9px] text-slate-400 font-bold uppercase">{leave.user.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-mono text-[10px] font-black uppercase text-primary">
                                                    {new Date(leave.startDate).toLocaleDateString()}
                                                </div>
                                                <div className="font-mono text-[10px] text-slate-400 font-bold">To</div>
                                                <div className="font-mono text-[10px] font-black uppercase text-primary">
                                                    {new Date(leave.endDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-mono text-[10px] leading-relaxed text-slate-600 italic">
                                                    "{leave.reason}"
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={`rounded-none font-mono text-[9px] uppercase border-2 ${leave.status === 'APPROVED' ? 'bg-emerald-500 text-white' :
                                                    leave.status === 'REJECTED' ? 'bg-destructive text-white' :
                                                        'bg-amber-400 text-slate-900 border-amber-500'
                                                    }`}>
                                                    {leave.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                {leave.status === 'PENDING' && (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAction(leave.id, 'APPROVED')}
                                                            className="h-8 w-8 p-0 rounded-none bg-emerald-500 hover:bg-emerald-600"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAction(leave.id, 'REJECTED')}
                                                            className="h-8 w-8 p-0 rounded-none bg-destructive hover:bg-red-700"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
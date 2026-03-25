"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Send, Palmtree, CheckCircle2, RefreshCw } from "lucide-react"
import { API_URL } from "@/lib/api";

export function LeaveRequestCard() {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [reason, setReason] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [userLeaves, setUserLeaves] = useState<any[]>([])

    const fetchUserLeaves = async () => {
        const userStr = localStorage.getItem("user")
        if (!userStr) return
        const user = JSON.parse(userStr)

        try {
            const res = await fetch(`${API_URL}/api/leave/user/${user.id}`)
            const data = await res.json()
            if (res.ok) setUserLeaves(data)
        } catch (err) {
            console.error("Failed to fetch user leaves", err)
        }
        finally {
            setIsFetching(false)
        }
    }
    // this part make sures we fetch data s soon s the component loads
    useEffect(() => {
        fetchUserLeaves()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const userStr = localStorage.getItem("user")
        if (!userStr)
            return
        const user = JSON.parse(userStr)

        setIsLoading(true)

        try {
            const res = await
                fetch(`${API_URL}/api/leave/request`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        startDate,
                        endDate,
                        reason
                    }),
                })
            if (res.ok) {
                setIsSuccess(true)
                setStartDate("")
                setEndDate("")
                setReason("")
                fetchUserLeaves() // Refresh the list
                setTimeout(() => setIsSuccess(false), 3000)
            }
        }
        catch (error) {
            console.error("Leave request failed", error)
        }
        finally {
            setIsLoading(false)
        }
    }
    return (
        <Card className="rounded-none border-2 border-slate-200 shadow-none hover:border-primary transition-colors bg-white h-[400px] flex flex-col">
            <CardHeader className="border-b-2 border-slate-100 pb-3 shrink-0 flex flex-row items-center justify-between">
                <CardTitle className="font-mono text-sm tracking-widest text-slate-500 uppercase font-black flex items-center gap-2">
                    <Palmtree className="w-4 h-4 text-primary" />
                    Leave_Application
                </CardTitle>
                <button
                    onClick={fetchUserLeaves}
                    className={`text-slate-400 hover:text-primary transition-colors ${isFetching ? 'animate-spin' : ''}`}
                    title="Refresh History"
                >
                    <RefreshCw className="w-3 h-3" />
                </button>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
                {isSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        <span className="font-mono text-xs font-black uppercase text-emerald-600">Request_Sent!</span>
                    </div>
                ) : (
                    <>
                        {/* Application Form */}
                        <form onSubmit={handleSubmit} className="space-y-3 shrink-0 border-b-2 border-slate-50 pb-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-mono font-black uppercase text-slate-400">Start</label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="rounded-none border-2 h-8 font-mono text-[10px] focus-visible:ring-0 focus-visible:border-primary"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-mono font-black uppercase text-slate-400">End</label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="rounded-none border-2 h-8 font-mono text-[10px] focus-visible:ring-0 focus-visible:border-primary"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-mono font-black uppercase text-slate-400">Reason</label>
                                <Input
                                    placeholder="Brief_reason..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="rounded-none border-2 h-8 font-mono text-[10px] focus-visible:ring-0 focus-visible:border-primary"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-8 rounded-none font-black text-xs uppercase font-mono tracking-tight bg-slate-900 hover:bg-primary text-white transition-colors"
                            >
                                {isLoading ? "Transmitting..." : "Submit_Application"}
                            </Button>
                        </form>
                        {/* Recent Requests List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[100px]">
                            <div className="text-[9px] font-mono font-black uppercase text-slate-400 mb-1 sticky top-0 bg-white pb-1 flex justify-between items-center">
                                <span>Recent_Requests</span>
                                <span className="bg-slate-100 px-1 text-slate-500">{userLeaves.length}</span>
                            </div>

                            {userLeaves.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-slate-100">
                                    <Clock className="w-4 h-4 text-slate-200 mb-1" />
                                    <div className="text-[9px] font-mono text-slate-300 italic uppercase">No_History_Found</div>
                                </div>
                            ) : (
                                userLeaves.map((leave) => (
                                    <div key={leave.id} className="border border-slate-100 p-2 flex justify-between items-center bg-slate-50/30 hover:border-slate-300 transition-colors">
                                        <div className="space-y-0.5">
                                            <div className="font-mono text-[9px] font-black uppercase text-slate-600">
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </div>
                                            <div className="font-mono text-[8px] text-slate-400 truncate max-w-[150px]">
                                                {leave.reason}
                                            </div>
                                        </div>
                                        <Badge className={`rounded-none font-mono text-[8px] uppercase border px-1 h-4 ${leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                            leave.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                                                'bg-amber-50 text-amber-600 border-amber-200'
                                            }`}>
                                            {leave.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}



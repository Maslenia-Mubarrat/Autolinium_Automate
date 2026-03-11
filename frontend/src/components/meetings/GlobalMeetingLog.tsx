"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, UserCheck, UserMinus, History } from "lucide-react"

export function GlobalMeetingLog() {
    const [meetings, setMeetings] = useState<any>(null);

    const fetchAll = () => {
        fetch('https://autolinium-automate-vgk4.vercel.app/api/meetings/admin/all')
            .then(res => res.json())
            .then(data => setMeetings(data));
    };

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 10000); // Polling for live status
        return () => clearInterval(interval);
    }, []);

    if (!meetings) return null;

    const allCombined = [
        ...meetings.internal.map((m: any) => ({ ...m, type: 'INTERNAL' })),
        ...meetings.client.map((m: any) => ({ ...m, type: 'CLIENT' }))
    ].sort((a, b) => new Date(b.meetingDate || b.scheduledTime).getTime() - new Date(a.meetingDate || a.scheduledTime).getTime());

    return (
        <Card className="rounded-none border-2 border-primary shadow-none bg-white">
            <CardHeader className="border-b-2 border-primary bg-slate-50 py-3">
                <CardTitle className="text-xs font-black uppercase font-mono flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Global_Meeting_Audit_Log
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full font-mono text-[11px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                                <th className="text-left p-4 uppercase">Session // Detail</th>
                                <th className="text-left p-4 uppercase">Staff // Status</th>
                                <th className="text-left p-4 uppercase">Time // Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allCombined.map((m: any, idx: number) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 uppercase line-clamp-1">{m.name || m.clientName}</span>
                                            <Badge className={`w-fit mt-1 rounded-none text-[8px] ${m.type === 'INTERNAL' ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                                                {m.type}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {m.attendees.map((a: any, aidx: number) => (
                                                <div key={aidx} className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5" title={a.user.name}>
                                                    <span className="text-[9px] font-bold">{a.user.name.split(' ')[0]}</span>
                                                    {a.status === 'ATTENDED' ? (
                                                        <UserCheck className="w-3 h-3 text-green-500" />
                                                    ) : (
                                                        <UserMinus className="w-3 h-3 text-slate-300" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-500 font-bold uppercase">
                                        {new Date(m.meetingDate || m.scheduledTime).toLocaleDateString()} // {new Date(m.meetingDate || m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Calendar, Clock, ShieldCheck, CheckSquare, Square } from "lucide-react"

interface UserList {
    id: number;
    name: string;
    employeeId: string;
}

export function AdminCommandBoard() {
    const [staff, setStaff] = useState<UserList[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [meetingName, setMeetingName] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [agenda, setAgenda] = useState("");
    const [isInternal, setIsInternal] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5000/api/users/list')
            .then(res => res.json())
            .then(data => setStaff(data));
    }, []);

    const toggleStaff = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCreateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIds.length === 0 || !meetingName || !meetingDate) return;

        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const admin = JSON.parse(userStr);

        setIsSubmitting(true);
        const endpoint = isInternal ? 'internal' : 'client';
        const payload = isInternal ? {
            name: meetingName,
            meetingDate,
            agenda,
            createdBy: admin.id,
            attendeeIds: selectedIds
        } : {
            clientName: meetingName,
            scheduledTime: meetingDate,
            createdBy: admin.id,
            attendeeIds: selectedIds
        };

        try {
            const res = await fetch(`http://localhost:5000/api/meetings/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Meeting Scheduled Successfully!");
                setMeetingName("");
                setMeetingDate("");
                setAgenda("");
                setSelectedIds([]);
            }
        } catch (err) {
            console.error("Meeting creation failed", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="admin-command-board-root rounded-none border-2 border-slate-200 shadow-none hover:border-primary transition-colors bg-white md:col-span-2 lg:col-span-2">
            <CardHeader className="border-b-2 border-slate-100 pb-3 shrink-0">
                <CardTitle className="text-sm tracking-widest text-slate-500 uppercase font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Executive_Command_Console
                    </div>
                    <Badge variant="outline" className="text-[9px] rounded-none">MISSION_CONTROL</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleCreateMeeting} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Side: Meeting Details */}
                    <div className="space-y-4">
                        <div className="flex gap-2 mb-4">
                            <Button
                                type="button"
                                onClick={() => setIsInternal(true)}
                                className={`flex-1 rounded-none font-mono text-[10px] uppercase font-black ${isInternal ? 'bg-primary' : 'bg-slate-100 text-slate-400'}`}
                            >
                                Internal Meeting
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setIsInternal(false)}
                                className={`flex-1 rounded-none font-mono text-[10px] uppercase font-black ${!isInternal ? 'bg-slate-800' : 'bg-slate-100 text-slate-400'}`}
                            >
                                Client Meeting
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-black text-slate-400 uppercase">Meeting_Title / Client_Name</label>
                            <Input
                                value={meetingName}
                                onChange={e => setMeetingName(e.target.value)}
                                className="rounded-none border-2 border-slate-200 focus:border-primary font-mono text-sm"
                                placeholder="E.G. PROJECT_UPDATE_SYNC"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-black text-slate-400 uppercase">Schedule_Time</label>
                            <Input
                                type={isInternal ? "date" : "datetime-local"}
                                value={meetingDate}
                                onChange={e => setMeetingDate(e.target.value)}
                                className="rounded-none border-2 border-slate-200 focus:border-primary font-mono text-sm"
                            />
                        </div>

                        {isInternal && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono font-black text-slate-400 uppercase">Action_Agenda</label>
                                <Input
                                    value={agenda}
                                    onChange={e => setAgenda(e.target.value)}
                                    className="rounded-none border-2 border-slate-200 focus:border-primary font-mono text-sm"
                                    placeholder="BRIEF_AGENDA..."
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting || selectedIds.length === 0}
                            className="w-full rounded-none bg-primary hover:bg-primary/90 font-mono font-black uppercase tracking-tighter mt-4"
                        >
                            {isSubmitting ? "PROCESSING..." : "SCHEDULE_AND_ASSIGN_STAFF"}
                        </Button>
                    </div>

                    {/* Right Side: Staff Selection */}
                    <div className="border-l-2 border-dashed border-slate-200 pl-8">
                        <label className="text-[10px] font-mono font-black text-slate-400 uppercase mb-4 block">Select_Required_Staff ({selectedIds.length})</label>
                        <div className="max-h-[220px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                            {staff.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => toggleStaff(user.id)}
                                    className={`flex items-center justify-between p-2 cursor-pointer transition-colors border ${selectedIds.includes(user.id) ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50'}`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold font-mono text-slate-800 uppercase">{user.name}</span>
                                        <span className="text-[9px] font-mono text-slate-400">{user.employeeId}</span>
                                    </div>
                                    {selectedIds.includes(user.id) ? (
                                        <CheckSquare className="w-4 h-4 text-primary" />
                                    ) : (
                                        <Square className="w-4 h-4 text-slate-200" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

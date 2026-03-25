"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock } from "lucide-react"
import { Button } from "../ui/button"
import { API_URL } from "@/lib/api";

export function MeetingCard() {
    const [meetings, setMeetings] = useState
        ({
            internal: [],
            client: []
        });
    const [isLoading, setIsLoading] = useState(true);

    const fetchMeetings = async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const user = JSON.parse(userStr);
        try {
            const response = await
                fetch(`${API_URL}/api/meetings/user/${user.id}`);
            const data = await response.json();
            setMeetings(data);
        }
        catch (error) {
            console.error("failed to fetch meetings:", error);
        }
        finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
        const interval = setInterval(fetchMeetings, 30000);
        return () => clearInterval(interval);
    }, []);

    const hasMeetings = meetings.internal.length > 0 || meetings.client.length > 0;
    const handleAction = async (type: 'internal' | 'client', meetingId: number) => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        const endpoint = type === 'internal' ? `internal/${meetingId}/attend` : `client/${meetingId}/join`;

        try {
            const response = await
                fetch(`${API_URL}/api/meetings/${endpoint}`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id })
                    }
                );
            if (response.ok) {
                fetchMeetings();
            }
        }
        catch (error) {
            console.error("Action Failed", error);
        }

    };
    return (
        <Card className="border-2 border-slate-200 hover:border-primary transition-colors rounded-none bg-white">
            <CardHeader className="border-b-2 border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm font-black uppercase font-mono flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4 text-primary" />
                    Meetings_Schedule
                </CardTitle>
                <Badge variant="outline" className="rounded-none font-mono text-[10px]">TODAY</Badge>
            </CardHeader>
            <CardContent className="p-0">
                {!hasMeetings ? (
                    <div className="p-8 text-center text-slate-400 font-mono text-[10px] uppercase">
                        No_Meetings_Scheduled
                    </div>
                ) : (
                    <div className="divide-y-2 divide-slate-100 font-mono">
                        {meetings.internal.map((m: any) => (
                            <div key={m.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <div>
                                    <Badge className="bg-primary text-white text-[9px] rounded-none mb-1">INTERNAL</Badge>
                                    <h3 className="text-xs font-black uppercase text-slate-800">{m.name}</h3>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Agenda: {m.agenda}</p>
                                </div>

                                {m.attendees[0]?.status !== 'ATTENDED' ? (
                                    <Button
                                        size="sm"
                                        className="h-8 rounded-none bg-slate-900 hover:bg-primary text-white text-[10px] uppercase font-black px-3"
                                        onClick={() => handleAction('internal', m.id)}
                                    >
                                        Confirm
                                    </Button>
                                ) : (
                                    <Badge className="bg-green-100 text-green-700 border-green-200 rounded-none text-[9px] uppercase font-bold">Attended</Badge>
                                )}
                            </div>
                        ))}
                        {meetings.client.map((m: any) => (
                            <div key={m.id} className="p-4 bg-blue-50/10 flex justify-between items-center hover:bg-blue-50/20 transition-colors">
                                <div>
                                    <Badge className="bg-slate-800 text-white text-[9px] rounded-none mb-1">CLIENT_SYNC</Badge>
                                    <h3 className="text-xs font-black uppercase text-slate-800">{m.clientName}</h3>
                                    <div className="text-[10px] text-primary font-black mt-1 uppercase flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {m.attendees[0]?.joinTime ? (
                                    <div className="text-right">
                                        <Badge className="bg-green-100 text-green-700 border-green-200 rounded-none text-[9px] uppercase font-bold mb-1">Joined</Badge>
                                        <div className="text-[8px] text-slate-400 font-bold uppercase">
                                            {new Date(m.attendees[0].joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        className="h-8 rounded-none bg-primary hover:bg-primary/90 text-white text-[10px] uppercase font-black px-3 border-2 border-primary"
                                        onClick={() => handleAction('client', m.id)}
                                    >
                                        Log_Join
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
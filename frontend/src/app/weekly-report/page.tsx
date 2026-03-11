"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FileText, Send, ClipboardList } from "lucide-react"

interface WeeklyReport {
    id: number; weekStartDate: string; submittedAt: string; content: string;
    user?: { name: string; employeeId: string };
}

export default function WeeklyReportPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [content, setContent] = useState("");
    const [weekStartDate, setWeekStartDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [reports, setReports] = useState<WeeklyReport[]>([]);

    const fetchReports = (user: any, admin: boolean) => {
        const url = admin ? "http://localhost:5000/api/weekly-report/all" : `http://localhost:5000/api/weekly-report/user/${user.id}`;
        fetch(url).then(r => r.json()).then(setReports);
    };

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            const user = JSON.parse(stored);
            setCurrentUser(user);
            const admin = user.role === "ADMIN";
            setIsAdmin(admin);
            fetchReports(user, admin);
        }
    }, []);

    const handleSubmit = async () => {
        if (!content.trim() || !weekStartDate) return alert("Please fill in all fields.");
        setSubmitting(true);
        await fetch("http://localhost:5000/api/weekly-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser?.id, weekStartDate, content })
        });
        alert("✅ Weekly report submitted!");
        setContent("");
        setSubmitting(false);
        fetchReports(currentUser, isAdmin);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 font-mono">
            <div className="border-l-4 border-cyan-500 pl-4">
                <h1 className="text-xl font-black uppercase text-slate-800">Weekly_Report_Log</h1>
                <p className="text-xs text-slate-400">Document your week — feeds the KPI engine automatically</p>
            </div>
            <Card className="rounded-none border-2 border-slate-200 hover:border-cyan-400 transition-colors shadow-none">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
                    <CardTitle className="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-500" /> Submit_Weekly_Report
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Week Starting (Monday)</label>
                        <input type="date" className="border border-slate-200 rounded px-3 py-2 text-sm font-mono w-full" value={weekStartDate} onChange={e => setWeekStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">This week's accomplishments</label>
                        <textarea className="w-full border border-slate-200 rounded px-3 py-2 text-sm font-mono h-32 resize-none"
                            placeholder="Describe tasks completed, challenges, and wins..."
                            value={content} onChange={e => setContent(e.target.value)} />
                    </div>
                    <button onClick={handleSubmit} disabled={submitting}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 text-sm uppercase flex items-center justify-center gap-2 rounded transition-colors">
                        <Send className="w-4 h-4" />{submitting ? "Submitting..." : "Submit Report"}
                    </button>
                </CardContent>
            </Card>
            <Card className="rounded-none border-2 border-slate-200 shadow-none">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
                    <CardTitle className="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-cyan-500" />
                        {isAdmin ? "All_Weekly_Reports" : "My_Report_History"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {reports.map(r => (
                            <div key={r.id} className="p-4 hover:bg-slate-50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase text-cyan-600">
                                        Week of {new Date(r.weekStartDate).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-3">
                                        {isAdmin && r.user && <span className="text-[10px] text-slate-400">{r.user.name} ({r.user.employeeId})</span>}
                                        <span className="text-[10px] text-slate-300">Submitted: {new Date(r.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{r.content}</p>
                            </div>
                        ))}
                        {reports.length === 0 && <div className="text-center p-6 text-slate-300 text-sm">No reports yet.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

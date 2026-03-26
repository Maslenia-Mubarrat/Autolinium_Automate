"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";

interface SummaryUser { id: number; name: string; employeeId: string; totalScore: number; }
interface DetailedKpi {
    kpi1Attendance: number; kpi2Timeliness: number; kpi3InternalMeetings: number;
    kpi4ClientMeetings: number; kpi5PeerReview: number; kpi6ProjectTask: number;
    kpi7WeeklyReport: number; kpi8ValueAdded: number; kpi9Innovation: number;
    totalSoFar: number;
}

export default function AdminKpiDashboard() {
    const [employees, setEmployees] = useState<SummaryUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<SummaryUser | null>(null);
    const [detailedKpi, setDetailedKpi] = useState<DetailedKpi | null>(null);
    const [manualScores, setManualScores] = useState({ kpi8: 0, kpi9: 0 });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Current Month/Year for target scoring
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    useEffect(() => {
        refreshSummary();
    }, []);

    const refreshSummary = async () => {
        const res = await fetch(`${API_URL}/api/admin/kpi/summary-all`);
        const data = await res.json();
        setEmployees(data);
        setLoading(false);
    };

    const handleUserClick = async (user: SummaryUser) => {
        setSelectedUser(user);
        const res = await fetch(`${API_URL}/api/kpi/status/${user.id}`);
        const data = await res.json();
        setDetailedKpi(data);
        setManualScores({
            kpi8: data.kpi8ValueAdded || 0,
            kpi9: data.kpi9Innovation || 0
        });
    };

    const saveScores = async () => {
        if (!selectedUser) return;
        setIsSaving(true);
        await fetch(`${API_URL}/api/admin/kpi/manual-save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: selectedUser.id, month, year, kpi8: manualScores.kpi8, kpi9: manualScores.kpi9 })
        });
        setIsSaving(false);
        refreshSummary(); // Refresh average on sidebar
    };

    if (loading) return <div className="p-10 font-mono italic opacity-50 uppercase tracking-widest">Initialising_Admin_Dashboard...</div>;

    return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
            <h1 className="text-4xl font-black italic font-mono mb-12 border-b-8 border-primary inline-block uppercase tracking-tighter shadow-sm">KPI // Control Center</h1>

            <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-12">
                {/* SEGMENT 1: Employee Summary List (All Employees) */}
                <div className="bg-slate-50 border-2 border-slate-200 p-6 shadow-sm">
                    <h2 className="font-mono text-[10px] uppercase font-bold text-slate-400 mb-6 italic border-b-2 border-slate-200 pb-2 tracking-widest">
                        Employee_Performance_Index
                    </h2>
                    <div className="space-y-2">
                        {employees.map(u => (
                            <button
                                key={u.id}
                                onClick={() => handleUserClick(u)}
                                className={`w-full group flex justify-between items-center p-4 border-2 transition-all ${selectedUser?.id === u.id ? 'bg-primary border-primary scale-[1.02] shadow-xl' : 'bg-white border-transparent hover:border-slate-300'}`}
                            >
                                <div className="text-left">
                                    <p className={`font-mono text-xs font-bold uppercase ${selectedUser?.id === u.id ? 'text-white' : 'text-slate-800'}`}>{u.name}</p>
                                    <p className={`font-mono text-[9px] ${selectedUser?.id === u.id ? 'text-white/50' : 'text-slate-400'}`}>ID: {u.employeeId}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-mono text-xl font-black ${selectedUser?.id === u.id ? 'text-white' : 'text-primary'}`}>{u.totalScore.toFixed(1)}</p>
                                    <p className={`font-mono text-[8px] uppercase font-bold ${selectedUser?.id === u.id ? 'text-white/50' : 'text-slate-300'}`}>Score</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SEGMENT 2: Detailed View & Manual Entry (Selected Employee Details) */}
                <div>
                    {selectedUser && detailedKpi ? (
                        <div className="space-y-8 animate-in fade-in active">

                            {/* Detailed Metrics List (ALL KPIs 1-9) */}
                            <div className="bg-white border-4 border-slate-100 p-8 shadow-2xl relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-xs select-none">DATA_PROTOCOL: SECURE</div>
                                <h3 className="font-black italic text-2xl mb-8 uppercase border-b-2 border-slate-50 pb-4">Breakdown // {selectedUser.name}</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { label: "KPI 1: Attendance", val: detailedKpi.kpi1Attendance },
                                        { label: "KPI 2: Timeliness", val: detailedKpi.kpi2Timeliness },
                                        { label: "KPI 3: Internal Mtg", val: detailedKpi.kpi3InternalMeetings },
                                        { label: "KPI 4: Client Mtg", val: detailedKpi.kpi4ClientMeetings },
                                        { label: "KPI 5: Peer Review", val: detailedKpi.kpi5PeerReview },
                                        { label: "KPI 6: Project Task", val: detailedKpi.kpi6ProjectTask },
                                        { label: "KPI 7: Weekly Report", val: detailedKpi.kpi7WeeklyReport },
                                        { label: "KPI 8: Value Added", val: detailedKpi.kpi8ValueAdded }, // Included!
                                        { label: "KPI 9: Innovation", val: detailedKpi.kpi9Innovation },   // Included!
                                    ].map((k, i) => (
                                        <div key={i} className="bg-slate-50 p-4 border border-slate-100 transition-colors hover:bg-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
                                            <p className="font-mono text-lg font-black text-slate-700">{(k.val || 0).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Segment: Manual Overscore */}
                            <div className="bg-primary/5 border-4 border-primary/20 p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 font-mono text-7xl font-black select-none pointer-events-none"></div>
                                <h3 className="font-black italic text-2xl mb-8 uppercase border-b-2 border-primary/10 pb-4">Manual Entry Layer</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    <div className="bg-white p-6 border-2 border-primary/20 shadow-lg group">
                                        <label className="block font-mono text-[10px] font-black uppercase text-primary mb-4 tracking-widest">KPI 8: Value Added (Max: 25.0)</label>
                                        <input
                                            type="number" step="0.1" max="25" min="0"
                                            className="w-full bg-slate-50 border-2 border-slate-200 p-4 font-mono text-4xl font-black outline-none focus:border-primary transition-all shadow-inner"
                                            value={manualScores.kpi8}
                                            onChange={e => setManualScores({ ...manualScores, kpi8: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="bg-white p-6 border-2 border-primary/20 shadow-lg group">
                                        <label className="block font-mono text-[10px] font-black uppercase text-primary mb-4 tracking-widest">KPI 9: Innovation (Max: 5.0)</label>
                                        <input
                                            type="number" step="0.1" max="5" min="0"
                                            className="w-full bg-slate-50 border-2 border-slate-200 p-4 font-mono text-4xl font-black outline-none focus:border-primary transition-all shadow-inner"
                                            value={manualScores.kpi9}
                                            onChange={e => setManualScores({ ...manualScores, kpi9: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={saveScores}
                                    disabled={isSaving}
                                    className="w-full bg-primary text-white p-8 mt-8 font-black uppercase tracking-[0.4em] hover:bg-black transition-all shadow-2xl disabled:opacity-50 active:scale-95"
                                >
                                    {isSaving ? 'Syncing_Database...' : 'Commit_Scores_To_DB'}
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-20 text-center bg-slate-50/50 grayscale opacity-40">
                            <div className="w-16 h-16 border-2 border-dashed border-slate-300 mb-6" />
                            <p className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Access_Protocol: Select_Employee_To_Fetch_Metrics</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

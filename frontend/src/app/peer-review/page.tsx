"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Star, Users, Send } from "lucide-react"

interface User { id: number; name: string; employeeId: string; }
interface PeerReview {
    id: number; reviewerId: number; targetUserId: number;
    month: number; year: number; averageScore: number;
    reviewer?: { name: string; employeeId: string };
    targetUser?: { name: string; employeeId: string };
}

export default function PeerReviewPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [colleagues, setColleagues] = useState<User[]>([]);
    const [allReviews, setAllReviews] = useState<PeerReview[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<string>("");
    const [scores, setScores] = useState({ respectScore: 5, helpfulnessScore: 5, attitudeScore: 5, conflictScore: 5, knowledgeShareScore: 5 });
    const [submitting, setSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            const user = JSON.parse(stored);
            setCurrentUser(user);
            setIsAdmin(user.role === "ADMIN");
        }
        fetch("http://localhost:5000/api/users/list").then(r => r.json()).then(setColleagues);
        fetch("http://localhost:5000/api/peer-review/all").then(r => r.json()).then(setAllReviews);
    }, []);

    const handleSubmit = async () => {
        if (!selectedTarget || !currentUser) return alert("Please select a colleague.");
        if (parseInt(selectedTarget) === currentUser.id) return alert("You cannot review yourself.");
        setSubmitting(true);
        const now = new Date();
        await fetch("http://localhost:5000/api/peer-review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reviewerId: currentUser.id, targetUserId: selectedTarget, month: now.getMonth() + 1, year: now.getFullYear(), ...scores })
        });
        alert("✅ Peer review submitted!");
        setSubmitting(false);
        fetch("http://localhost:5000/api/peer-review/all").then(r => r.json()).then(setAllReviews);
    };

    const ScoreInput = ({ label, field }: { label: string; field: keyof typeof scores }) => (
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-[11px] font-mono text-slate-600 uppercase">{label}</span>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button key={n} onClick={() => setScores(s => ({ ...s, [field]: n }))}
                        className={`w-6 h-6 text-[9px] font-bold rounded border transition-colors ${scores[field] >= n ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white text-slate-400 border-slate-200 hover:border-cyan-300'}`}>
                        {n}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 font-mono">
            <div className="border-l-4 border-cyan-500 pl-4">
                <h1 className="text-xl font-black uppercase text-slate-800">Peer_Review_Engine</h1>
                <p className="text-xs text-slate-400">Rate your colleagues — data feeds directly into KPI scores</p>
            </div>
            <Card className="rounded-none border-2 border-slate-200 hover:border-cyan-400 transition-colors shadow-none">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
                    <CardTitle className="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
                        <Star className="w-4 h-4 text-cyan-500" /> Submit_Peer_Review
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Select Colleague</label>
                        <select className="w-full border border-slate-200 rounded px-3 py-2 text-sm font-mono" value={selectedTarget} onChange={e => setSelectedTarget(e.target.value)}>
                            <option value="">— Choose a colleague —</option>
                            {colleagues.filter(c => c.id !== currentUser?.id).map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.employeeId})</option>
                            ))}
                        </select>
                    </div>
                    <ScoreInput label="Respect & Professionalism" field="respectScore" />
                    <ScoreInput label="Helpfulness & Teamwork" field="helpfulnessScore" />
                    <ScoreInput label="Attitude & Positivity" field="attitudeScore" />
                    <ScoreInput label="Conflict Resolution" field="conflictScore" />
                    <ScoreInput label="Knowledge Sharing" field="knowledgeShareScore" />
                    <button onClick={handleSubmit} disabled={submitting}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 text-sm uppercase flex items-center justify-center gap-2 rounded transition-colors">
                        <Send className="w-4 h-4" />{submitting ? "Submitting..." : "Submit Peer Review"}
                    </button>
                </CardContent>
            </Card>

            {isAdmin && (
                <Card className="rounded-none border-2 border-slate-200 shadow-none">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
                        <CardTitle className="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
                            <Users className="w-4 h-4 text-cyan-500" /> Office_Peer_Review_Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-[11px] font-mono">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left p-3 uppercase">Reviewer</th>
                                    <th className="text-left p-3 uppercase">Target</th>
                                    <th className="text-left p-3 uppercase">Month/Year</th>
                                    <th className="text-left p-3 uppercase">Avg Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {allReviews.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50">
                                        <td className="p-3 font-bold">{r.reviewer?.name ?? r.reviewerId}</td>
                                        <td className="p-3">{r.targetUser?.name ?? r.targetUserId}</td>
                                        <td className="p-3 text-slate-400">{r.month}/{r.year}</td>
                                        <td className="p-3 text-cyan-600 font-bold">⭐ {r.averageScore.toFixed(1)}/10</td>
                                    </tr>
                                ))}
                                {allReviews.length === 0 && <tr><td colSpan={4} className="text-center p-6 text-slate-300">No peer reviews yet.</td></tr>}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

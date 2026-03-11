"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Clock, User } from "lucide-react"

export function GlobalTaskLog() {
    const [tasks, setTasks] = useState<any[]>([]);

    const fetchTasks = () => {
        fetch('https://autolinium-automate-vgk4.vercel.app/api/tasks/admin/all')
            .then(res => res.json())
            .then(data => setTasks(data));
    };

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 15000);
        return () => clearInterval(interval);
    }, []);

    //Task review and rating
    const handleReviewTask = async (taskId: number) => {
        // Collect the score and comment using standard browser prompts for speed
        const scoreStr = prompt("Rate this task out of 5 (e.g., 5):");
        if (!scoreStr) return; // Administrator canceled
        const score = parseInt(scoreStr);

        if (isNaN(score) || score < 1 || score > 5) {
            alert("Invalid score. Please enter a number between 1 and 5.");
            return;
        }

        const comment = prompt("Enter manager feedback for this task:");
        if (comment === null) return;

        try {
            const response = await fetch(`https://autolinium-automate-vgk4.vercel.app/api/tasks/${taskId}/review`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reviewScore: score,
                    managerComment: comment
                })
            });

            if (!response.ok) throw new Error("Failed to submit review");

            alert("Review successfully saved!");
            // Optionally, you could trigger a state refresh here to re-fetch tasks
        } catch (err) {
            console.error(err);
            alert("An error occurred while saving the review.");
        }
    };


    return (
        <Card className="rounded-none border-2 border-slate-200 hover:border-primary transition-colors bg-white shadow-none">
            <CardHeader className="border-b-2 border-slate-100 bg-slate-50/50 py-3">
                <CardTitle className="text-xs font-black uppercase font-mono flex items-center gap-2 text-slate-500">
                    <History className="w-4 h-4 text-primary" />
                    Office_Task_Audit_Log
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <table className="w-full font-mono text-[11px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left p-4 uppercase">Task_Title</th>
                            <th className="text-left p-4 uppercase">Assignee</th>
                            <th className="text-left p-4 uppercase">Deadline</th>
                            <th className="text-left p-4 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tasks.map((task: any) => {
                            const isLate = new Date(task.deadline) < new Date() && task.status === 'PENDING';
                            return (
                                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold uppercase">{task.title}</td>
                                    <td className="p-4 flex items-center gap-2">
                                        <User className="w-3 h-3 text-slate-300" />
                                        {task.assignee.name}
                                    </td>
                                    <td className={`p-4 font-bold ${isLate ? 'text-red-500' : 'text-slate-400'}`}>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {new Date(task.deadline).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`rounded-none text-[8px] ${isLate ? 'border-red-500 text-red-500 bg-red-50' : ''}`}>
                                                {isLate ? 'LATE' : task.status}
                                            </Badge>
                                            {task.status === 'DONE' && (
                                                task.reviewScore ? (
                                                    <span className="text-yellow-500 text-[10px] font-bold">⭐ {task.reviewScore}/5</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReviewTask(task.id)}
                                                        className="text-[9px] bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-300 px-2 py-0.5 rounded transition-colors font-bold uppercase"
                                                    >
                                                        Review is saved
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}

"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Clock, User } from "lucide-react"

export function GlobalTaskLog() {
    const [tasks, setTasks] = useState<any[]>([]);

    const fetchTasks = () => {
        fetch('http://localhost:5000/api/tasks/admin/all')
            .then(res => res.json())
            .then(data => setTasks(data));
    };

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 15000);
        return () => clearInterval(interval);
    }, []);

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
                                        <Badge variant="outline" className={`rounded-none text-[8px] ${isLate ? 'border-red-500 text-red-500 bg-red-50' : ''}`}>
                                            {isLate ? 'LATE' : task.status}
                                        </Badge>
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

"use client"

import { useState, useEffect } from "react";
import { TaskBoard } from "@/components/dashboard/TaskBoard";
import { GlobalTaskLog } from "@/components/tasks/GlobalTaskLog";
import { ShieldCheck } from "lucide-react";

export default function TasksPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) setUser(JSON.parse(userStr));
    }, []);

    if (!user) return null;

    return (
        <div className="task-hub-container space-y-8 pb-20">
            <div className="header-section">
                <h1 className="text-3xl font-black text-primary uppercase font-mono tracking-tighter">
                    Workflow // {user.role === 'ADMIN' ? 'Command_Center' : 'Personal_Ledger'}
                </h1>
                <p className="text-slate-400 font-mono text-xs uppercase font-bold mt-1">
                    {user.role === 'ADMIN' ? 'Overseeing Office-Wide Assignments' : 'Your Professional Task History'}
                </p>
            </div>

            {user.role === 'ADMIN' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <TaskBoard />
                    </div>
                    <div className="lg:col-span-2">
                        <GlobalTaskLog />
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <TaskBoard />
                </div>
            )}
        </div>
    );
}

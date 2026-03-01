"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClipboardList, Plus, CheckCircle2, Loader2, User as UserIcon } from "lucide-react"

interface Task {
    id: number;
    title: string;
    description: string | null;
    status: string;
    createdAt: string;
    assignee: {
        name: string;
    }

}

export function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    //fetching all tasks from the API
    const fetchTasks = async () => {
        try {
            const response = await
                fetch('http://localhost:5000/api/tasks');
            const data = await response.json();
            if (response.ok) {
                setTasks(data);
            }



        }
        catch (error) {
            console.error("failed to fetch tasks:", error);

        }
        finally {
            setIsLoading(false);

        }
    };
    useEffect(() => { fetchTasks(); }, []);

    //create a new task (the "quick add function")
    const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTaskTitle.trim())
            return;
        setIsCreating(true);
        try {
            const response = await
                fetch('http://localhost:5000/api/tasks',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: newTaskTitle,
                            description: "Quick task from dashboard",
                            assigneeId: 1

                        })
                    }
                );

            if (response.ok) {
                setNewTaskTitle("");
                fetchTasks();
            }

        }
        catch (error) {
            console.error("Create task failed:", error);
        }
        finally {
            setIsCreating(false);
        }

    };
    //Mark a task as done
    const handleMarkDone = async (taskId: number) => {
        try {
            const response = await
                fetch(`http://localhost:5000/api/tasks/${taskId}/status`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'DONE' })
                    }
                );
            if (response.ok)
                fetchTasks();//this will refresh the list

        }
        catch (error) {
            console.error("update task failed:", error);

        }
    };
    return (
        <Card className="task-board-root-container rounded-none border-2 border-slate-200 shadow-none hover:border-primary transition-colors bg-white h-[350px] flex flex-col">
            <CardHeader className="border-b-2 border-slate-100 pb-3 shrink-0">
                <CardTitle className="font-mono text-sm tracking-widest text-slate-500 uppercase font-bold flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-primary" />
                        Office_Board
                    </div>
                    <Badge variant="outline" className="text-[9px] rounded-none">ADMIN_VIEW</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
                {/* 1. Quick Add Input */}
                <form onSubmit={handleCreateTask} className="task-quick-add-form flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Type_New_Task..."
                            className="rounded-none border-2 h-9 font-mono text-xs focus-visible:ring-0 focus-visible:border-primary pr-8"
                        />
                        {isCreating && <Loader2 className="absolute right-2 top-2 w-4 h-4 animate-spin text-slate-300" />}
                    </div>
                    <Button type="submit" disabled={isCreating || !newTaskTitle} className="h-9 rounded-none bg-slate-800 hover:bg-primary px-3">
                        <Plus className="w-4 h-4" />
                    </Button>
                </form>
                {/* 2. Task List Scrollable Area */}
                <div className="task-list-container flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="text-center py-10 font-mono text-[10px] text-slate-400 animate-pulse">Scanning_Database...</div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-10 font-mono text-[10px] text-slate-400 border border-dashed border-slate-100">NO_PENDING_TASKS</div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className={`task-item-card border-l-4 p-3 flex justify-between items-center transition-all ${task.status === 'DONE' ? 'border-emerald-400 bg-emerald-50/30' : 'border-primary bg-slate-50/50'}`}>
                                <div className="space-y-1">
                                    <h4 className={`text-xs font-bold font-mono tracking-tight ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 font-bold uppercase tracking-tighter">
                                        <UserIcon className="w-3 h-3" />
                                        {task.assignee.name}
                                    </div>
                                </div>
                                {task.status === 'PENDING' && (
                                    <Button
                                        onClick={() => handleMarkDone(task.id)}
                                        variant="outline"
                                        className="h-7 rounded-none border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}




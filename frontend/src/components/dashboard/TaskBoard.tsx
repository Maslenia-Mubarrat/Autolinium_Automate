"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClipboardList, Plus, CheckCircle2, Loader2, User as UserIcon, Clock } from "lucide-react"

interface Task {
    id: number;
    title: string;
    description: string | null;
    status: string;
    createdAt: string;
    deadline: string; // Added this
    completionNote: string | null; // Added this
    assignee: {
        name: string;
    }

}

export function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [newTaskDeadline, setNewTaskDeadline] = useState("");
    const [staff, setStaff] = useState<any[]>([]);
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>("");
    const [user, setUser] = useState<any>(null);


    const fetchTasks = async () => {
        // 1. We have to define 'user' here first!
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            // 2. Now the computer knows what user.id is
            const response = await fetch(`https://autolinium-automate-vgk4.vercel.app/api/tasks/user/${user.id}`);
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

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            setSelectedAssigneeId(parsedUser.id.toString()); // Default to self

            if (parsedUser.role === 'ADMIN') {
                fetch('https://autolinium-automate-vgk4.vercel.app/api/users/list')
                    .then(res => res.json())
                    .then(data => setStaff(data));
            }
        }
        fetchTasks();
    }, []);

    //create a new task (the "quick add function")
    const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTaskTitle.trim())
            return;

        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);


        setIsCreating(true);
        try {
            const response = await
                fetch('https://autolinium-automate-vgk4.vercel.app/api/tasks',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: newTaskTitle,
                            description: "Command from board",
                            assigneeId: parseInt(selectedAssigneeId),
                            deadline: newTaskDeadline || new Date() // Sending your chosen date!
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
    const handleMarkDone = async (task: Task) => { // Change: We pass the whole task object now
        const isLate = new Date(task.deadline) < new Date();

        // 1. If late, the message is much more "Serious"
        const promptMessage = isLate
            ? "⚠️ THIS TASK IS LATE. You MUST provide an explanation for the delay:"
            : "Mission Accomplished! Enter a quick completion note:";

        const reason = prompt(promptMessage);

        // 2. ENFORCEMENT: If it's late and they leave it blank, we STOP them.
        if (isLate && (!reason || reason.trim().length < 5)) {
            alert("🚨 ERROR: You cannot close a LATE task without a valid explanation (minimum 5 characters).");
            return;
        }

        if (reason === null) return; // User clicked Cancel

        try {
            const response = await fetch(`https://autolinium-automate-vgk4.vercel.app/api/tasks/${task.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'DONE',
                    completionNote: reason || "Task completed on time."
                })
            });
            if (response.ok) fetchTasks();
        } catch (error) {
            console.error("Update task failed:", error);
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
                <form onSubmit={handleCreateTask} className="task-quick-add-form flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <Input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Type_New_Task..."
                            className="rounded-none border-2 h-9 font-mono text-xs focus-visible:ring-0 focus-visible:border-primary"
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono font-black text-slate-400 uppercase">Deadline</label>
                                <Input
                                    type="date"
                                    value={newTaskDeadline}
                                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                                    className="rounded-none border-2 h-8 font-mono text-[10px] uppercase font-bold text-slate-500"
                                />
                            </div>

                            {user?.role === 'ADMIN' && (
                                <div className="space-y-1">
                                    <label className="text-[8px] font-mono font-black text-slate-400 uppercase">Assign_To</label>
                                    <select
                                        value={selectedAssigneeId}
                                        onChange={(e) => setSelectedAssigneeId(e.target.value)}
                                        className="w-full rounded-none border-2 border-slate-200 h-8 font-mono text-[10px] uppercase font-bold text-slate-600 bg-white px-2 focus:border-primary outline-none"
                                    >
                                        <option value={user.id}>MYSELF</option>
                                        {staff.filter(s => s.id !== user.id).map(s => (
                                            <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button type="submit" disabled={isCreating || !newTaskTitle} className="w-full h-8 rounded-none bg-slate-800 hover:bg-primary font-mono text-[10px] uppercase font-black tracking-tighter">
                        {isCreating ? 'PROCESS_WAIT...' : 'PUSH_COMMAND_TO_STAFF'}
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
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 font-bold uppercase tracking-tighter">
                                            <UserIcon className="w-3 h-3" />
                                            {task.assignee.name}
                                        </div>
                                        <div className={`flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-tighter ${new Date(task.deadline) < new Date() && task.status === 'PENDING' ? 'text-red-500' : 'text-slate-400'}`}>
                                            <Clock className="w-3 h-3" />
                                            Due: {new Date(task.deadline).toLocaleDateString()}
                                        </div>
                                        {task.status === 'DONE' && task.completionNote && (
                                            <div className="text-[9px] font-mono italic text-emerald-600 bg-emerald-50 p-1 border border-emerald-100 mt-1">
                                                Note: {task.completionNote}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {task.status === 'PENDING' && (
                                    <Button
                                        onClick={() => handleMarkDone(task)}
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




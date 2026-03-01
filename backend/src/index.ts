import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

dotenv.config();

const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Ok', message: 'Autolinium API is running' });
});

//route to fetch users from database
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users from database' });
    }
});


// 3. New Attendance Check-In Route
/*
app.post('/api/attendance/check-out', async(req, res) =>
{
    const {userId = 1} = req.body;

    //getting creent date in dhaka
    const now = new Date();
    const options: any = {timeZone:'Asia/Dhaka',
                          year: 'numeric',
                          month: '2-digit',
                          day:'2-digit'
                         };
    const formatter = new Intl.DateTimeFormat('en-CA',options);
    const localToday = new Date(formatter.format(now));
    
    try{
        const record = await prisma.attendance.findFirst({
            where: {userId: userId,
                    recordDate: localToday
            }
        });
        if(!record || !record.entryTime)
        {
            return res.status(404).json({error:'No active check-in found'});
        }
        //work duration calculation
        const entryTime = new Date(record.entryTime);
        const diffMs = now.getTime() - entryTime.getTime();
        const workMinutes = Math.floor(diffMs/(1000*60));

        //overtime calculation
        const overtimeMinutes = Math.max(0,workMinutes-480);
        const updated = await
        
    }
    catch(error){}
});
*/


// 4. Get Today's Attendance Status (Multi-timezone safe)
app.get('/api/attendance/status/:userId', async (req, res) => {
    const { userId } = req.params;

    // 💡 THE FIX: Force the computer to use Bangladesh's calendar date
    const now = new Date();
    const options: any = { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const localToday = new Date(formatter.format(now));

    try {
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId: parseInt(userId),
                recordDate: localToday
            }
        });

        res.status(200).json({
            checkedIn: !!attendance,
            data: attendance
        });
    } catch (error) {
        console.error("Status Check Error:", error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

//getting all attendance for today from database - user table and attendacne table
app.get('/api/attendance/today', async (req, res) => {
    const now = new Date();
    const options: any = {
        timeZone: 'Asia/Dhaka', year: 'numeric',
        month: '2-digit', day: '2-digit'
    };


    const formatter = new Intl.DateTimeFormat('en-ca', options);
    const localToday = new Date(formatter.format(now));


    try {
        const records = await prisma.attendance.findMany(
            {

                where: {
                    recordDate: localToday
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            employeeId: true,
                            email: true,
                        }
                    }
                }

            }
        );

        res.status(200).json({

            date: formatter.format(now),
            totalPresent: records.length,
            records: records
        });




    }
    catch (error) {
        console.error("Attendance error:", error);
        res.status(500).json({ error: "Failed to fetch attendance" });
    }

});

// DIAGNOSTIC ROUTE — DELETE AFTER TESTING
app.get('/api/kpi/test', (req, res) => {
    res.json({ status: 'kpi routes are working' });
});

app.get('/api/kpi/status/:userId', async (req, res) => {

    const { userId } = req.params;

    const now = new Date();
    const options: any = {
        timeZone: 'Asia/Dhaka', year: 'numeric',
        month: '2-digit', day: '2-digit'
    };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const localDateStr = formatter.format(now);
    const [year, month] = localDateStr.split('-').map(Number);

    const monthStart = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
    const monthEnd = new Date(year, month, 1);

    try {
        const records = await prisma.attendance.findMany({
            where: {
                userId: parseInt(userId),
                recordDate: { gte: monthStart, lt: monthEnd }
            }
        });

        // KPI 1: Attendance (starts at 10)
        let kpi1 = 10;
        const absentRecords = records.filter(r => r.presenceStatus === 'ABSENT');

        for (const record of absentRecords) {
            if (record.absenceInfo === 'UNINFORMED') {
                kpi1 -= 2;
            } else if (record.absenceInfo === 'GRANTED') {
                kpi1 -= 0;
            } else {
                kpi1 -= 1;
            }
        }

        // KPI 2: Timeliness (starts at 10)
        let kpi2 = 10;
        const uninformedLateRecords = records.filter(r =>
            r.lateStatus === 'LATE_AUTO' || r.lateStatus === 'LATE_UNINFORMED'
        );

        for (const record of uninformedLateRecords) {
            if (record.entryTime && record.recordDate) {
                const recordDateUTC = new Date(record.recordDate);
                const officeOpenUTC = new Date(recordDateUTC.getTime() + 5 * 60 * 60 * 1000);
                const entryUTC = new Date(record.entryTime);
                const lateMs = Math.max(0, entryUTC.getTime() - officeOpenUTC.getTime());
                const lateMinutes = lateMs / (1000 * 60);
                const deduction = Math.floor(lateMinutes / 30) * 0.25;
                kpi2 -= deduction;
            }
        }

        // Clamp both scores between 0 and 10 — OUTSIDE the loop
        kpi1 = Math.min(10, Math.max(0, kpi1));
        kpi2 = Math.min(10, Math.max(0, kpi2));

        res.status(200).json({
            userId: parseInt(userId),
            month,
            year,
            totalDaysLogged: records.length,
            absentDays: absentRecords.length,
            uninformedLateDays: uninformedLateRecords.length,
            kpi1Attendance: kpi1,
            kpi2Timeliness: kpi2,
            totalSoFar: kpi1 + kpi2,
            pending: [
                "KPI2: Informed late with promiseTime — needs late approval system (Day 4)",
                "KPI2: Granted late tracking — needs admin approval UI (Day 4)",
                "KPI2: Overtime bonus — needs check-out system (Day 6)",
                "KPI3-9 — future sprints"
            ]
        });

    } catch (error) {
        console.error("KPI Error:", error);
        res.status(500).json({ error: "Failed to calculate KPI" });
    }

});

// 1. Fetching all the tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({ // Use 'task' (Lowercase)
            include: {
                assignee: { // Relationship name is 'assignee' for the Task model
                    select: { name: true, employeeId: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(tasks);
    } catch (error) {
        console.error("failed", error);
        res.status(500).json({ error: "failed to fetch task" });
    }
});

// 2. Updating task status
app.patch('/api/tasks/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedTask = await prisma.task.update({ // Use 'task' (Lowercase)
            where: { id: parseInt(id) },
            data: { status } // Use 'data' (not date)
        });
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("failed", error);
        res.status(500).json({ error: 'failed to update' });
    }
});
//creating a new task
app.post('/api/tasks', async (req, res) => {
    const { title, description, assigneeId } = req.body;
    try {
        const newTask = await prisma.task.create({
            data: {
                title: title,
                description: description,
                assigneeId: parseInt(assigneeId)
            }

        });
        res.status(201).json(newTask);

    }
    catch (error) {
        console.error("Failed to create  task:", error);
        res.status(500).json({ error: 'Failed to create task' });

    }
});

//check out route ()
/*
app.post('/api/attendance/check-out', async (req, res) => {
    const { userId = 1 } = req.body;

    //getting creent date in dhaka
    const now = new Date();
    const options: any = {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const localToday = new Date(formatter.format(now));

    try {
        const record = await prisma.attendance.findFirst({
            where: {
                userId: userId,
                recordDate: localToday
            }
        });
        if (!record || !record.entryTime) {
            return res.status(404).json({ error: 'No active check-in found' });
        }
        //work duration calculation
        const entryTime = new Date(record.entryTime);
        const diffMs = now.getTime() - entryTime.getTime();
        const workMinutes = Math.floor(diffMs / (1000 * 60));

        //overtime calculation
        const overtimeMinutes = Math.max(0, workMinutes - 480);
        const updated = await
        
    }
    catch (error) { }
});
*/




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

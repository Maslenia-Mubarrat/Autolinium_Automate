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

// --- Authentication: Login Route ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("🔑 Auth: Login attempt for", email);

    try {
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user || user.passwordHash !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Return the user object (excluding the password for safety)
        const { passwordHash, ...userWithoutPassword } = user;
        res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Login server error:", error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
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
app.post('/api/attendance/check-in', async (req, res) => {
    console.log("📣 Backend: Received Check-In request", req.body);
    const { userId = 1 } = req.body;

    // Use local office date (YYYY-MM-DD) for consistency
    const now = new Date();
    const options: any = { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const localToday = new Date(formatter.format(now));

    try {
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isPastEleven = hours > 11 || (hours === 11 && minutes > 0);

        const record = await prisma.attendance.create({
            data: {
                userId: userId,
                recordDate: localToday, // Storing the local calendar day
                entryTime: now,
                presenceStatus: 'PRESENT',
                lateStatus: isPastEleven ? 'LATE_AUTO' : 'TIMELY',
            }
        });

        res.status(201).json({
            message: 'Check-in successful',
            data: record
        });
    } catch (error) {
        console.error("Check-in Error:", error);
        res.status(500).json({ error: 'Failed to log attendance' });
    }
});


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


//KPI score route
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
            prisma.attendance.update({
                where: { id: record.id },
                data: {
                    exitTime: now,
                    workMinutes: workMinutes,
                    overtimeMinutes: overtimeMinutes
                }

            });
        res.status(200).json({ message: 'Check-out successful', data: updated });


    }
    catch (error) {
        console.error("Check out eror", error);
        res.status(500).json({ error: 'Failed to log check out' });
    }
});


//admin's late approval route
app.patch('/api/attendance/approve-late/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const record = await
            prisma.attendance.update({
                where: { id: parseInt(id) },
                data: {
                    lateStatus: 'TIMELY',
                    adminOverride: true

                }

            }


            );
        res.status(200).json({ message: 'Late arrival approved', data: record });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to approve late' });
    }


});

// submitting new leave request
app.post('/api/leave/request', async (req, res) => {
    const { userId, startDate, endDate, reason } = req.body;
    console.log(`Leave new request from user ${userId}`);
    try {
        const leave = await prisma.leaveRequest.create(
            {
                data: {
                    userId: parseInt(userId),
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    reason,
                    status: 'PENDING'

                }
            }
        );
        res.status(201).json({ message: 'Leave request submitted', data: leave });

    }
    catch (error) {
        console.error("Leaver request error:", error);
        res.status(500).json({ error: 'failed to submit leave request' });

    }
});

// getting all leave requests for admin
app.get('/api/leave/all', async (req, res) => {
    try {
        const leaves = await prisma.leaveRequest.findMany({
            include: { user: { select: { name: true, employeeId: true } } },
            orderBy: { requestedAt: 'desc' }
        });
        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaves' });
    }
});


// approving or rejecting a leave
app.patch('/api/leave/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const leave = await prisma.leaveRequest.update(
            {
                where: { id: parseInt(id) },
                data: { status }
            }
        );
        res.status(200).json({ message: `leave ${status.toLowerCase()} successful`, data: leave });

    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update leave status' });
    }
});

// 4. Get leave requests for a specific user (For Employee View)
app.get('/api/leave/user/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(`🔍 Leave: Fetching history for user ${userId}`);
    try {
        const leaves = await prisma.leaveRequest.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { requestedAt: 'desc' }
        });
        console.log(`✅ Leave: Found ${leaves.length} records for user ${userId}`);
        res.status(200).json(leaves);
    } catch (error) {
        console.log(`❌ Leave: Error for user ${userId}`, error);
        res.status(500).json({ error: 'Failed to fetch user leave requests' });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

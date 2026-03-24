import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MeetingStatus, PrismaClient } from '@prisma/client';
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

//  New route to get simplified user list for selection 
app.get('/api/users/list', async (req, res) => {
    try {
        const users = await prisma.user.findMany({

            // for now we are listing every employee, not filtering anyone,might need to filter later

            select: {
                id: true,
                name: true,
                employeeId: true
            }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user list' });
    }
});


// 3. New Attendance Check-In Route
app.post('/api/attendance/check-in', async (req, res) => {
    console.log("📣 Backend: Received Check-In request", req.body);
    const { userId } = req.body;
    if (!userId)
        return res.status(400).json({ error: 'User ID is required for check-in' });

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
                locationMode: req.body.locationMode || 'OFFICE', // Safe fallback
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
        // 1. Fetch attendance records
        const records = await prisma.attendance.findMany({
            where: {
                userId: parseInt(userId),
                recordDate: { gte: monthStart, lt: monthEnd }
            }
        });

        // 2. Fetch approved leaves for this month
        const approvedLeaves = await prisma.leaveRequest.findMany({
            where: {
                userId: parseInt(userId),
                status: 'APPROVED',
                OR: [
                    { startDate: { gte: monthStart, lt: monthEnd } },
                    { endDate: { gte: monthStart, lt: monthEnd } }
                ]
            }
        });

        // KPI 1: Attendance (starts at 10)
        let kpi1 = 10;
        const absentRecords = records.filter(r => r.presenceStatus === 'ABSENT');
        let grantedLeaveDays = 0;

        for (const record of absentRecords) {
            // Check if this specific day was covered by an approved leave
            const isOnLeave = approvedLeaves.some(leave =>
                record.recordDate >= leave.startDate && record.recordDate <= leave.endDate
            );

            if (isOnLeave) {
                {
                    grantedLeaveDays++;
                    if (grantedLeaveDays > 3) {
                        kpi1 -= 0.5;
                    }
                }


            } else if (record.absenceInfo === 'UNINFORMED') {
                kpi1 -= 2;
            } else {
                kpi1 -= 1;
            }
        }

        // KPI 2: Timeliness (starts at 10)
        let kpi2 = 10;
        let grantedLateDays = 0;

        const lateRecords = records.filter(r => r.lateStatus !== 'TIMELY');

        for (const record of lateRecords) {
            if (!record.entryTime || !record.recordDate) continue;

            // Office time starts at 11:00 AM local time
            const recordDateUTC = new Date(record.recordDate);
            const officeOpenUTC = new Date(recordDateUTC.getTime() + 5 * 60 * 60 * 1000);
            const entryUTC = new Date(record.entryTime);

            // 1. Granted Late (using new LATE_GRANTED enum)
            if (record.lateStatus === 'LATE_GRANTED') {
                grantedLateDays++;
                if (grantedLateDays > 4) {
                    kpi2 -= 0.5; // -0.5 per day after 4th request
                }
            }
            // 2. Uninformed Late (or Auto Late)
            else if (record.lateStatus === 'LATE_AUTO' || record.lateStatus === 'LATE_UNINFORMED') {
                const lateMs = Math.max(0, entryUTC.getTime() - officeOpenUTC.getTime());
                const lateMinutes = lateMs / (1000 * 60);
                if (lateMinutes > 0) {
                    const deduction = Math.floor(lateMinutes / 30) * 0.25;
                    kpi2 -= deduction;
                }
            }
            // 3. Informed Late (Arrive after promised time)
            else if (record.lateStatus === 'LATE_INFORMED' && record.promiseTime) {
                const promiseUTC = new Date(record.promiseTime);
                const lateMs = Math.max(0, entryUTC.getTime() - promiseUTC.getTime());
                const lateMinutes = lateMs / (1000 * 60);
                if (lateMinutes > 0) {
                    const deduction = Math.floor(lateMinutes / 10) * 0.25;
                    kpi2 -= deduction;
                }
            }
        }

        // Overtime Bonus (After 8 hours/480 mins, +0.25 every 30 mins)
        for (const record of records) {
            if (record.workMinutes > 480) {
                const overtimeMins = record.workMinutes - 480;
                const bonus = Math.floor(overtimeMins / 30) * 0.25;
                kpi2 += bonus;
            }
        }
        // Make sure scores never go below 0 or above 10


        // KPI 3: Internal Meetings (starts at 10)
        let kpi3 = 10;
        const internalMeetings = await prisma.internalMeetingAttendee.findMany({
            where: {
                userId: parseInt(userId),
                meeting: {
                    meetingDate: { gte: monthStart, lt: monthEnd }
                }
            }
        });

        for (const attendance of internalMeetings) {
            if (attendance.status === 'INFORMED_SKIP') {
                kpi3 -= 1;
            } else if (attendance.status === 'UNINFORMED_SKIP') {
                kpi3 -= 2; // The PRD says "-2 total" which means a steeper penalty per skip
            }
        }

        kpi1 = Math.min(10, Math.max(0, kpi1));
        kpi2 = Math.min(10, Math.max(0, kpi2));
        kpi3 = Math.min(10, Math.max(0, kpi3));



        // Send data back to the frontend
        res.status(200).json({
            userId: parseInt(userId),
            month,
            year,
            totalDaysLogged: records.length,
            absentDays: absentRecords.length,
            approvedLeaveDays: approvedLeaves.length,
            kpi1Attendance: kpi1,
            kpi2Timeliness: kpi2,
            kpi3InternalMeetings: kpi3,
            totalSoFar: kpi1 + kpi2 + kpi3
        });


    }


    catch (error) {
        console.error("KPI Error:", error);
        res.status(500).json({ error: "Failed to calculate KPI" });
    }

});


//this is for attendance history

app.get('/api/attendance/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const records = await prisma.attendance.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { recordDate: 'desc' },
            take: 30 // Last 30 days
        });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance history' });
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



// 2. Updating task status: captured completion note and auto-calculates delay/completion time
app.patch('/api/tasks/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, completionNote } = req.body;

    try {
        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: {
                status,
                completionNote,
                completedAt: status === 'DONE' ? new Date() : null
            }
        });
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("failed", error);
        res.status(500).json({ error: 'failed to update' });
    }
});

// --- Task Review Engine (Admin Only) ---
app.patch('/api/tasks/:id/review', async (req, res) => {
    const taskId = parseInt(req.params.id);
    const { reviewScore, managerComment } = req.body;

    try {
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                reviewScore: parseInt(reviewScore),
                managerComment: managerComment,
            },
            include: { assignee: true }
        });

        console.log(`⭐ Task ${taskId} reviewed with score: ${reviewScore}`);
        res.json(updatedTask);
    } catch (error) {
        console.error("Error saving task review:", error);
        res.status(500).json({ error: "Failed to save review" });
    }
});



// 3. Creating a new task: validates assignee and sets the deadline for KPI tracking
app.post('/api/tasks', async (req, res) => {
    const { title, description, assigneeId, deadline } = req.body;
    try {
        const newTask = await prisma.task.create({
            data: {
                title: title,
                description: description,
                assigneeId: parseInt(assigneeId),
                deadline: deadline ? new Date(deadline) : new Date()
            }

        });
        res.status(201).json(newTask);

    }
    catch (error) {
        console.error("Failed to create  task:", error);
        res.status(500).json({ error: 'Failed to create task' });

    }
});

// Fetch tasks for a specific user
app.get('/api/tasks/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const tasks = await prisma.task.findMany({
            where: { assigneeId: parseInt(userId) },
            include: { assignee: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user tasks" });
    }
});




//check out route ()

app.post('/api/attendance/check-out', async (req, res) => {
    const { userId } = req.body;
    if (!userId)
        return res.status(400).json({ error: 'User ID is required for check-out' });


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

// Meeting tracking starts from here

//  Update Internal Meeting Route (Fixing Status) ---
app.post('/api/meetings/internal', async (req, res) => {
    const { name, meetingDate, agenda, createdBy, attendeeIds } = req.body;
    try {
        const meeting = await prisma.internalMeeting.create({
            data: {
                name,
                meetingDate: new Date(meetingDate),
                agenda,
                createdBy: parseInt(createdBy),
                attendees: {
                    create: attendeeIds.map((uid: number) => ({
                        userId: uid,
                        status: 'UNINFORMED_SKIP' // Changed from ATTENDED so employees can confirm
                    }))
                }
            },
            include: { attendees: true }
        });
        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create internal meeting' });
    }
});
// Update Client Meeting Route (Fixing Status) ---
app.post('/api/meetings/client', async (req, res) => {
    const { clientName, scheduledTime, createdBy, attendeeIds } = req.body;
    try {
        const meeting = await prisma.clientMeeting.create({
            data: {
                clientName,
                scheduledTime: new Date(scheduledTime),
                createdBy: parseInt(createdBy),
                attendees: {
                    create: attendeeIds.map((uid: number) => ({
                        userId: uid,
                        status: 'UNINFORMED_SKIP' // Changed from ATTENDED
                    }))
                }
            },
            include: { attendees: true }
        });
        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create client meeting' });
    }
});


//get user meetings for dashboard (employee)
app.get('/api/meetings/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const internal = await prisma.internalMeeting.findMany({
            where: {
                meetingDate: { gte: today },
                attendees: { some: { userId: parseInt(userId) } }

            },
            include: { attendees: { where: { userId: parseInt(userId) } } }
        }

        );

        const client = await prisma.clientMeeting.findMany(
            {
                where:
                {
                    scheduledTime: { gte: today },
                    attendees: { some: { userId: parseInt(userId) } }

                },
                include: { attendees: { where: { userId: parseInt(userId) } } }

            }
        );
        res.status(200).json({ internal, client });


    }
    catch (error) {
        res.status(500).json({ error: 'failed to fetch user meetings' });
    }
});

// employee confirms attending an internal meeting
app.patch(
    '/api/meetings/internal/:meetingId/attend',
    async (req, res) => {
        const { meetingId } = req.params;
        const { userId } = req.body;
        try {
            await prisma.internalMeetingAttendee.update(
                {// the composite id wiill
                    //be used, defined in schema
                    where:
                    {
                        meetingId_userId:
                        {
                            meetingId: parseInt(meetingId),
                            userId: parseInt(userId)
                        }
                    },
                    data: { status: 'ATTENDED' }

                }
            );
            res.status(200).json({ message: 'Attendance confirmed' });
        }
        catch (error) {
            console.error("Attendance Error:", error);
            res.status(500).json({ error: 'Failed to confirm attendacne' });
        }

    }
);

// employee confirms attending a client meeting
app.patch(
    '/api/meetings/client/:meetingId/join',
    async (req, res) => {
        const { meetingId } = req.params;
        const { userId } = req.body;

        try {
            await prisma.clientMeetingAttendee.update(
                {
                    where:
                    {
                        meetingId_userId:
                        {
                            meetingId: parseInt(meetingId),
                            userId: parseInt(userId)
                        }
                    },
                    data:
                    {
                        joinTime: new Date(),
                        //auto logs right now
                        status: 'ATTENDED'
                    }
                }
            );
            res.status(200).json({ message: 'Join time logged' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to log join time' });
        }
    }
);

//  Admin View See ALL meetings and ALL attendee statuses
app.get('/api/meetings/admin/all', async (req, res) => {
    try {
        const internal = await prisma.internalMeeting.findMany({
            include: {
                attendees: { include: { user: { select: { name: true, employeeId: true } } } }
            },
            orderBy: { meetingDate: 'desc' }
        });

        const client = await prisma.clientMeeting.findMany({
            include: {
                attendees: { include: { user: { select: { name: true, employeeId: true } } } }
            },
            orderBy: { scheduledTime: 'desc' }
        });

        res.status(200).json({ internal, client });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all meetings' });
    }
});

//  Admin view to  See ALL tasks across the entire office 
app.get('/api/tasks/admin/all', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                assignee: { select: { id: true, name: true, employeeId: true } }
            },
            orderBy: { deadline: 'asc' }
        });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all tasks' });
    }
});

// === PEER REVIEW SYSTEM ===

app.post('/api/peer-review', async (req, res) => {
    const { reviewerId, targetUserId, month, year, respectScore, helpfulnessScore, attitudeScore, conflictScore, knowledgeShareScore } = req.body;
    try {
        const averageScore = (respectScore + helpfulnessScore + attitudeScore + conflictScore + knowledgeShareScore) / 5;
        const review = await prisma.peerReview.create({
            data: {
                reviewerId: parseInt(reviewerId), targetUserId: parseInt(targetUserId),
                month: parseInt(month), year: parseInt(year),
                respectScore: parseInt(respectScore), helpfulnessScore: parseInt(helpfulnessScore),
                attitudeScore: parseInt(attitudeScore), conflictScore: parseInt(conflictScore),
                knowledgeShareScore: parseInt(knowledgeShareScore), averageScore
            }
        });
        res.status(201).json(review);
    } catch (error) { res.status(500).json({ error: 'Failed to submit peer review' }); }
});

app.get('/api/peer-review/received/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const reviews = await prisma.peerReview.findMany({
            where: { targetUserId: userId },
            include: { reviewer: { select: { name: true, employeeId: true } } },
            orderBy: { year: 'desc' }
        });
        res.json(reviews);
    } catch (error) { res.status(500).json({ error: 'Failed to fetch peer reviews' }); }
});

app.get('/api/peer-review/all', async (req, res) => {
    try {
        const reviews = await prisma.peerReview.findMany({
            include: {
                reviewer: { select: { name: true, employeeId: true } },
                targetUser: { select: { name: true, employeeId: true } }
            },
            orderBy: { year: 'desc' }
        });
        res.json(reviews);
    } catch (error) { res.status(500).json({ error: 'Failed to fetch all peer reviews' }); }
});

// === WEEKLY REPORT SYSTEM ===

app.post('/api/weekly-report', async (req, res) => {
    const { userId, weekStartDate, content } = req.body;
    try {
        const report = await prisma.weeklyReport.create({
            data: { userId: parseInt(userId), weekStartDate: new Date(weekStartDate), content }
        });
        res.status(201).json(report);
    } catch (error) { res.status(500).json({ error: 'Failed to submit weekly report' }); }
});

app.get('/api/weekly-report/user/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const reports = await prisma.weeklyReport.findMany({ where: { userId }, orderBy: { weekStartDate: 'desc' } });
        res.json(reports);
    } catch (error) { res.status(500).json({ error: 'Failed to fetch weekly reports' }); }
});

app.get('/api/weekly-report/all', async (req, res) => {
    try {
        const reports = await prisma.weeklyReport.findMany({
            include: { user: { select: { name: true, employeeId: true } } },
            orderBy: { weekStartDate: 'desc' }
        });
        res.json(reports);
    } catch (error) { res.status(500).json({ error: 'Failed to fetch all weekly reports' }); }
});



if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
module.exports = app;



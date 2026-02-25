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
app.post('/api/attendance/check-in', async (req, res) => {
    console.log("📣 Backend: Received Check-In request", req.body);
    const { userId = 1 } = req.body;

    // Use local office date (YYYY-MM-DD) for consistency
    const now = new Date();
    const options: any = { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const localDate = new Date(formatter.format(now));

    try {
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isPastEleven = hours > 11 || (hours === 11 && minutes > 0);

        const record = await prisma.attendance.create({
            data: {
                userId: userId,
                recordDate: localDate, // Storing the local calendar day
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






app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

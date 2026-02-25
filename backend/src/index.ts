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
    // For now, we manually use userId: 1 (Until we build Login)
    const { userId = 1 } = req.body;
    const now = new Date();

    try {
        // Business Logic: Is it past 9:00 AM?
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isLate = hours > 11 || (hours === 11 && minutes > 0);

        const record = await prisma.attendance.create({
            data: {
                userId: userId,
                recordDate: now,
                entryTime: now,
                presenceStatus: 'PRESENT',
                lateStatus: isLate ? 'LATE_AUTO' : 'TIMELY',
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





app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

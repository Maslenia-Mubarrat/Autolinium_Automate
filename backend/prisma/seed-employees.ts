import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

// 1. Load your credentials from .env
dotenv.config();

// 2. Setup the "Bridge" to your PostgreSQL warehouse
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runTheSeed() {
    // 3. Find the CSV file (jumping up 2 levels to the root)
    const csvPath = path.resolve(__dirname, '../../Autolinium_employee_data.csv');
    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split('\n').slice(1); // skip header line

    console.log(`🚀 Starting Seed: Importing ${lines.length} lines.`);

    for (const line of lines) {
        if (!line.trim()) continue;

        const cols = line.split(',');
        const empId = cols[0]; // The ALM ID
        const name = cols[1];
        const email = cols[2];

        if (!email || !email.includes('@')) continue;

        console.log(`📥 Importing: [${empId}] ${name}`);

        // This creates the user if they don't exist
        await prisma.user.upsert({
            where: { email: email.trim() },
            update: { employeeId: empId.trim() },
            create: {
                employeeId: empId.trim(),
                name: name.trim(),
                email: email.trim(),
                passwordHash: 'placeholder_password',
                role: 'EMPLOYEE',
            }
        });
    }
    console.log('✅ Success: Warehouse updated with all team members!');
}

// 4. Start the process
runTheSeed()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });

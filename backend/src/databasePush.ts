import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs";
import path from "path";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting CSV Push...");
    const csvPath = path.join(__dirname, "../../Autolinium_employee_data.csv");
    const data = fs.readFileSync(csvPath, "utf-8");

    const lines = data.split("\n").filter(l => l.trim() !== "");
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
        // Split by comma but respect quotes (basic CSV parser)
        const line = lines[i];
        let parts = [];
        let cur = "";
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
            if (line[j] === '"') inQuotes = !inQuotes;
            else if (line[j] === ',' && !inQuotes) {
                parts.push(cur);
                cur = "";
            } else {
                cur += line[j];
            }
        }
        parts.push(cur);

        const employeeId = parts[0]?.trim();
        const name = parts[1]?.trim();
        let email = parts[2]?.trim();
        const role = parts[8]?.trim();

        if (!employeeId || !name) continue;

        // Give a default email if missing to satisfy unique constraint
        if (!email) {
            email = `${employeeId.toLowerCase().replace(/[^a-z0-9]/g, '')}@autolinium.local`;
        }

        // Only insert if it doesn't already exist
        const existing = await prisma.user.findUnique({ where: { employeeId } });
        if (!existing) {
            await prisma.user.create({
                data: {
                    employeeId,
                    name,
                    email,
                    passwordHash: 'autolinium2026', // default password
                    role: role === 'System Admin' || employeeId === 'ALM-009' ? 'ADMIN' : 'EMPLOYEE',
                    baseSalary: 0
                }
            });
            console.log(`Pushed: ${name} (${employeeId})`);
        }
    }

    // Ensure Admin 1 is always created just in case
    await prisma.user.upsert({
        where: { email: 'maslenia.csecu@gmail.com' },
        update: { role: 'ADMIN' },
        create: {
            employeeId: 'ADMIN-MASTER',
            email: 'maslenia.csecu@gmail.com',
            name: 'System Admin',
            passwordHash: 'admin',
            role: 'ADMIN',
            baseSalary: 0,
        },
    });

    console.log("✅ Database Push Complete!");
}

main()
    .catch((e) => {
        console.error("Error during push:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

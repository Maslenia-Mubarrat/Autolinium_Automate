import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Start seeding...');

    const admin = await prisma.user.upsert({
        where: { email: 'maslenia.csecu@gmail.com' },
        update: {},
        create: {
            employeeId: 'ADMIN-001',

            email: 'maslenia.csecu@gmail.com',
            name: 'System Admin',
            passwordHash: 'admin',
            role: 'ADMIN',
            baseSalary: 0,
        },

    });
    console.log({ admin });
    console.log('Seeding finished');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


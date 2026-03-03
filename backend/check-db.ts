import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userId = 9;
    const leaves = await prisma.leaveRequest.findMany({
        where: { userId: userId },
    });
    console.log(`User ${userId} Leaves:`, JSON.stringify(leaves, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('seeding meetings for mission');
    // i am logged in as user 9 
    const userId = 9;

    //creating an internal meeting for today
    await prisma.internalMeeting.create(
        {
            data: {
                name: "Architecture Sync",
                meetingDate: new Date(),
                agenda: "Code review",
                createdBy: userId,
                attendees: {
                    create: { userId: userId, status: 'UNINFORMED_SKIP' }
                }

            }
        }
    );

    //create a client meeting for TODAY
    await prisma.clientMeeting.create(
        {
            data: {
                clientName: "Autolinium admin",
                scheduledTime: new Date(),
                createdBy: userId,
                attendees: {
                    create: { userId: userId, status: 'UNINFORMED_SKIP' }
                }
            }
        }
    );

    console.log('seeding finished, refresh the dashboard');
}
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);

    })
    .finally(async () => {
        await prisma.$disconnect();
    });
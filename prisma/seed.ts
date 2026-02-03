import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
    const email = "admin@myorderfellow.com";

    // check if admin exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });

    if (!existingAdmin) {
        console.log("Creating Super Admin...");
        const password = await bcrypt.hash("Pa$$w0rd!", 10);

        await prisma.admin.create({
            data: {
                email,
                password,
                name: "System Administrator",
                role: Role.SUPER_ADMIN,
            },
        });
        console.log("Admin created");
    } else {
        console.log("Admin already exists");
    }
}

main()
    .then(async () => { await prisma.$disconnect(); })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
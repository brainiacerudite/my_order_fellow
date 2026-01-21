import { PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: config.database.url })
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: config.server.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    });

if (!config.server.isProduction) globalForPrisma.prisma = prisma;
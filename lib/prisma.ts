import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Disable transactions for MongoDB free tier (M0) which doesn't support them
    transactionOptions: {
      maxWait: 0,
      timeout: 0,
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


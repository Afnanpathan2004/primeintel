import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;

// Explicitly guard against any legacy SQLite connection attempts
if (databaseUrl && (databaseUrl.startsWith('file:') || databaseUrl.startsWith('sqlite:'))) {
  throw new Error(
    '[PrimeIntel Database Error] SQLite connection strings ("file:" or "sqlite:") are not supported. PrimeIntel is configured for Supabase PostgreSQL. Please configure DATABASE_URL and DIRECT_URL with your Supabase PostgreSQL connection string.'
  );
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

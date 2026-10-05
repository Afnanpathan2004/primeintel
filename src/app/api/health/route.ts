import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getSanitizedHost(connectionString?: string): string {
  if (!connectionString) return 'unconfigured';
  try {
    const url = new URL(connectionString.replace(/^postgresql:\/\//, 'http://').replace(/^postgres:\/\//, 'http://'));
    return `${url.hostname}${url.port ? ':' + url.port : ''}`;
  } catch {
    return 'configured';
  }
}

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = 'healthy';
  const dbEngine = 'PostgreSQL';
  const dbHost = getSanitizedHost(process.env.DATABASE_URL);
  let isConnected = false;
  let tablesProvisioned = false;
  let dbDiagnostic: string | null = null;
  let activePricingVersion: string | null = null;
  let activeServicesCount = 0;

  try {
    // Step 1: Verify direct PostgreSQL socket connection
    await prisma.$queryRaw`SELECT 1 as connected`;
    isConnected = true;
  } catch (connError: any) {
    dbStatus = 'degraded';
    isConnected = false;
    const msg = connError?.message || '';
    const cleanMsg = msg
      .split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s && !s.startsWith('Invalid `prisma.') && !s.includes('invocation:'))[0] || 'Unable to establish PostgreSQL connection';
    dbDiagnostic = cleanMsg.replace(/:[^:@\s]+@/, ':***@');
    console.error('[HealthCheck] DB socket check failed:', connError?.message || connError);
  }

  if (isConnected) {
    try {
      // Step 2: Verify schema tables exist
      const [version, count] = await Promise.all([
        prisma.pricingVersion.findFirst({
          where: { status: 'ACTIVE' },
          select: { version: true },
        }),
        prisma.service.count({ where: { active: true } }),
      ]);
      tablesProvisioned = true;
      activePricingVersion = version?.version || null;
      activeServicesCount = count;
    } catch (schemaError: any) {
      dbStatus = 'degraded';
      tablesProvisioned = false;
      dbDiagnostic = 'Database connected, but schema migrations pending. Run `npx prisma migrate deploy`.';
      console.error('[HealthCheck] DB schema check failed:', schemaError?.message || schemaError);
    }
  }

  const aiStatus = process.env.GEMINI_API_KEY ? 'gemini_configured' : 'heuristic_fallback_active';
  const isHealthy = dbStatus === 'healthy' && activePricingVersion !== null;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      environment: process.env.NODE_ENV || 'development',
      components: {
        database: {
          status: dbStatus,
          engine: dbEngine,
          host: dbHost,
          connected: isConnected,
          tablesProvisioned,
          ...(dbDiagnostic ? { diagnostic: dbDiagnostic } : {}),
        },
        pricingEngine: {
          status: activePricingVersion ? 'configured' : 'unconfigured',
          activeVersion: activePricingVersion,
          activeServices: activeServicesCount,
        },
        aiAnalyzer: {
          provider: aiStatus,
          promptInjectionDefense: 'active',
          factAttribution: 'active',
        },
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}

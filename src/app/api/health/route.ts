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
  let dbDiagnostic: string | null = null;
  let activePricingVersion: string | null = null;
  let activeServicesCount = 0;

  try {
    // 1. Verify direct query execution against PostgreSQL
    await prisma.$queryRaw`SELECT 1 as connected`;

    // 2. Verify schema queries
    const [version, count] = await Promise.all([
      prisma.pricingVersion.findFirst({
        where: { status: 'ACTIVE' },
        select: { version: true },
      }),
      prisma.service.count({ where: { active: true } }),
    ]);

    activePricingVersion = version?.version || null;
    activeServicesCount = count;
  } catch (error: any) {
    dbStatus = 'degraded';
    // Return sanitized error code/summary without exposing credentials or internal tokens
    dbDiagnostic = error?.code || 'Unable to establish PostgreSQL connection';
    console.error('[HealthCheck] DB check failed:', error?.message || error);
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
          connected: dbStatus === 'healthy',
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

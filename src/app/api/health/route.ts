import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = 'healthy';
  let activePricingVersion: string | null = null;
  let activeServicesCount = 0;

  try {
    const [version, count] = await Promise.all([
      prisma.pricingVersion.findFirst({
        where: { status: 'ACTIVE' },
        select: { version: true },
      }),
      prisma.service.count({ where: { active: true } }),
    ]);

    activePricingVersion = version?.version || null;
    activeServicesCount = count;
  } catch (error) {
    dbStatus = 'degraded';
    console.error('[HealthCheck] DB check failed:', error);
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

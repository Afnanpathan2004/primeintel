import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  const totalUsers = await prisma.user.count();

  return NextResponse.json({
    authenticated: user !== null,
    user,
    systemInitialized: totalUsers > 0,
  });
}

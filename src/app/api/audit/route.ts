import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser && !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Audit log inspection requires ADMIN or SUPER_ADMIN role.' },
        { status: 403 }
      );
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

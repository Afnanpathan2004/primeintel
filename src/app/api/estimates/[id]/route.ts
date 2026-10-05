import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estimate = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: {
        pricingVersion: true,
      },
    });

    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: estimate });
  } catch (error: any) {
    console.error('[API:estimate GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch estimate', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, internalNotes, reason } = body;

    const current = await prisma.estimate.findUnique({
      where: { id: params.id },
    });

    if (!current) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.estimate.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(internalNotes !== undefined ? { internalNotes } : {}),
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'ESTIMATE',
        entityId: params.id,
        action: status ? 'STATUS_CHANGE' : 'UPDATE',
        performedBy: 'PrimeCore Estimator',
        oldValue: JSON.stringify({ status: current.status, internalNotes: current.internalNotes }),
        newValue: JSON.stringify({ status: updated.status, internalNotes: updated.internalNotes }),
        reason: reason || 'Estimate status/notes updated by estimator',
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[API:estimate PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update estimate', details: error.message },
      { status: 500 }
    );
  }
}

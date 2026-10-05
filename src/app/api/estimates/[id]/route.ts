import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estimate = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: {
        pricingVersion: true,
        revisions: { orderBy: { revisionNumber: 'desc' } },
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
    const currentUser = await getCurrentUser();
    const actorEmail = currentUser?.email || 'estimator@primecoreinfo.com';

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

    const updated = await prisma.$transaction(async (tx) => {
      // If estimate was already approved or exported, create a revision record (Section 21, 22)
      let nextRevisionNumber = current.revisionNumber;
      if (['APPROVED', 'EXPORTED', 'SENT'].includes(current.status) && status && status !== current.status) {
        nextRevisionNumber = current.revisionNumber + 1;
        await tx.estimateRevision.create({
          data: {
            estimateId: current.id,
            revisionNumber: current.revisionNumber,
            finalPrice: current.finalPrice,
            indicativeLow: current.indicativeLow,
            indicativeHigh: current.indicativeHigh,
            discountAmount: current.discountAmount,
            overrideReason: current.overrideReason,
            snapshot: JSON.stringify(current),
            changedBy: actorEmail,
            changeReason: reason || `Status transitioned from ${current.status} to ${status}`,
          },
        });
      }

      const res = await tx.estimate.update({
        where: { id: params.id },
        data: {
          ...(status ? { status } : {}),
          ...(internalNotes !== undefined ? { internalNotes } : {}),
          revisionNumber: nextRevisionNumber,
        },
      });

      // Append-only audit log
      await tx.auditLog.create({
        data: {
          actor: actorEmail,
          action: status ? 'STATUS_CHANGE' : 'UPDATE',
          entity: 'ESTIMATE',
          entityId: params.id,
          oldValue: JSON.stringify({ status: current.status, notes: current.internalNotes }),
          newValue: JSON.stringify({ status: res.status, notes: res.internalNotes }),
          reason: reason || `Estimate status updated to ${status || current.status}`,
        },
      });

      return res;
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

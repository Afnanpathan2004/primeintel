import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/passwords';
import { createSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const existingCount = await prisma.user.count();
    if (existingCount > 0) {
      return NextResponse.json(
        { error: 'System has already been bootstrapped. Please log in.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Valid email, full name, and password (at least 8 characters) are required.' },
        { status: 400 }
      );
    }

    const { salt, hash } = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role: 'SUPER_ADMIN',
        salt,
        passwordHash: hash,
        active: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actor: user.email,
        action: 'CREATE',
        entity: 'USER',
        entityId: user.id,
        reason: 'Initial system administrator bootstrap',
      },
    });

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('[API:auth/bootstrap] Error:', error);
    return NextResponse.json(
      { error: 'Bootstrap failed', details: error.message },
      { status: 500 }
    );
  }
}

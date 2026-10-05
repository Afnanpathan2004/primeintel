import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'ESTIMATOR' | 'VIEWER';

export const SESSION_COOKIE_NAME = 'primeintel_session';
export const SESSION_DURATION_HOURS = 24;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mustChangePassword: boolean;
}

/**
 * Creates a database-backed session token and sets secure HTTP-only cookie
 */
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

/**
 * Validates the session cookie against the database
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    // If running in development without auth configured, check if any user exists
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          mustChangePassword: true,
          active: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date() || !session.user.active) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return session.user as AuthUser;
}

/**
 * Server-side authorization guard
 * Throws an error response object if user is unauthenticated or unauthorized
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Response(
      JSON.stringify({ error: 'Authentication required. Please log in.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // SUPER_ADMIN has access to everything
    if (user.role !== 'SUPER_ADMIN' && !allowedRoles.includes(user.role)) {
      throw new Response(
        JSON.stringify({
          error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${user.role}.`,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return user;
}

/**
 * Terminates session and removes cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

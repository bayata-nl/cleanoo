import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

type AdminPayload = {
  id: string;
  email: string;
  role: 'admin';
  name?: string;
};

const ADMIN_COOKIE_NAME = 'adminToken';

type StaffPayload = {
  id: string;
  email: string;
  role: 'staff';
  name?: string;
};

const STAFF_COOKIE_NAME = 'staffToken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export function createAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '24h' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AdminPayload;
  } catch {
    return null;
  }
}

export function getAdminFromRequest(request: NextRequest): AdminPayload | null {
  const cookieToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const header = request.headers.get('authorization');
  const bearerToken = header?.startsWith('Bearer ')
    ? header.substring('Bearer '.length)
    : undefined;
  const token = cookieToken || bearerToken;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export function requireAdmin(
  request: NextRequest
): { user: AdminPayload } | NextResponse {
  const user = getAdminFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }
  return { user };
}

export function getAdminEnvCredentials() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL/ADMIN_PASSWORD are not set');
  }
  return { email, password };
}

export function createStaffToken(payload: StaffPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyStaffToken(token: string): StaffPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as StaffPayload;
  } catch {
    return null;
  }
}

export function getStaffFromRequest(request: NextRequest): StaffPayload | null {
  const cookieToken = request.cookies.get(STAFF_COOKIE_NAME)?.value;
  const header = request.headers.get('authorization');
  const bearerToken = header?.startsWith('Bearer ')
    ? header.substring('Bearer '.length)
    : undefined;
  const token = cookieToken || bearerToken;
  if (!token) return null;
  return verifyStaffToken(token);
}

export function setStaffCookie(response: NextResponse, token: string) {
  response.cookies.set(STAFF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export function clearStaffCookie(response: NextResponse) {
  response.cookies.set(STAFF_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export function requireAdminJson(request: NextRequest): NextResponse | null {
  const result = requireAdmin(request);
  if ('user' in result) return null;
  return result as NextResponse;
}




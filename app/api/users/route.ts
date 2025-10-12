import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/sqlite';
import { requireAdminJson } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireAdminJson(request);
    if (unauthorized) return unauthorized;

    const users = db.prepare(`
      SELECT id, name, email, phone, address, email_verified, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}


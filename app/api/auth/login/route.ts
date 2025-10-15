import { NextRequest, NextResponse } from 'next/server';
import { createUserToken, setUserCookie } from '@/lib/auth';
import db from '@/lib/sqlite';
import bcrypt from 'bcryptjs';

// THIS IS CUSTOMER LOGIN ONLY!
// Admin login: /api/auth/admin-login
// Staff login: /api/auth/staff-login

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // ONLY check customers table
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, (user as any).password);
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    const token = createUserToken({
      id: String((user as any).id),
      email: (user as any).email,
      role: 'customer',
      name: (user as any).name
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: String((user as any).id),
        name: (user as any).name,
        email: (user as any).email,
        phone: (user as any).phone,
        address: (user as any).address
      }
    });

    setUserCookie(response, token);
    return response;
    
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, setAdminCookie, getAdminEnvCredentials, createUserToken, setUserCookie } from '@/lib/auth';
import db from '@/lib/sqlite';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Check admin credentials first
    try {
      const { email: adminEmail, password: adminPassword } = getAdminEnvCredentials();
      if (email === adminEmail && password === adminPassword) {
        const response = NextResponse.json({
          success: true,
          user: {
            id: '1',
            name: 'Admin',
            email: adminEmail,
            role: 'admin'
          }
        });

        const token = createAdminToken({ id: '1', email: adminEmail, role: 'admin', name: 'Admin' });
        setAdminCookie(response, token);

        return response;
      }
    } catch (adminError) {
      // Admin credentials not set, continue to check customer
    }

    // Check customer in database
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (user) {
      const isValidPassword = await bcrypt.compare(password, (user as any).password);
      if (isValidPassword) {
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
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid credentials'
    }, { status: 401 });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

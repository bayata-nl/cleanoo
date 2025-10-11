import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, setAdminCookie, getAdminEnvCredentials } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Admin credentials from environment
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

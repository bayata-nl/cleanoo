import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (admin) {
      return NextResponse.json({
        success: true,
        user: admin
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Not authenticated'
    }, { status: 401 });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

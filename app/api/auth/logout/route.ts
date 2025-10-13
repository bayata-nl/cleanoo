import { NextRequest, NextResponse } from 'next/server';
import { clearAdminCookie, clearStaffCookie, clearUserCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear all authentication cookies
    clearAdminCookie(response);
    clearStaffCookie(response);
    clearUserCookie(response);
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

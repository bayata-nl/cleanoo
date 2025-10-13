import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, getStaffFromRequest, getUserFromRequest } from '@/lib/auth';
import db from '@/lib/sqlite';

export async function GET(request: NextRequest) {
  try {
    // Check admin
    const admin = getAdminFromRequest(request);
    if (admin) {
      return NextResponse.json({
        success: true,
        user: admin,
        role: 'admin'
      });
    }

    // Check staff
    const staff = getStaffFromRequest(request);
    if (staff) {
      return NextResponse.json({
        success: true,
        user: staff,
        role: 'staff'
      });
    }

    // Check customer
    const customer = getUserFromRequest(request);
    if (customer) {
      // Get full user data from database
      const userData = db.prepare('SELECT id, name, email, phone, address, email_verified FROM users WHERE id = ?').get(customer.id);
      if (userData) {
        return NextResponse.json({
          success: true,
          user: {
            id: String((userData as any).id),
            name: (userData as any).name,
            email: (userData as any).email,
            phone: (userData as any).phone,
            address: (userData as any).address
          },
          role: 'customer'
        });
      }
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

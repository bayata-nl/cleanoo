import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/sqlite';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { createAdminToken, setAdminCookie } from '@/lib/auth';

// GET: Verify token and get booking info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find booking by token
    const booking = db.prepare(`
      SELECT id, name, email, phone, address, service_type, preferred_date, preferred_time, status
      FROM bookings 
      WHERE verification_token = ? AND status = 'pending_verification'
    `).get(token) as any;

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update booking status to pending_password
    db.prepare(`
      UPDATE bookings 
      SET status = 'pending_password', 
          verified_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(booking.id);

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        name: booking.name,
        email: booking.email,
        serviceType: booking.service_type,
        preferredDate: booking.preferred_date,
        preferredTime: booking.preferred_time,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}

// POST: Complete registration with password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find booking by token
    const booking = db.prepare(`
      SELECT id, name, email, phone, address, service_type, preferred_date, preferred_time
      FROM bookings 
      WHERE verification_token = ? AND status = 'pending_password'
    `).get(token) as any;

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token or booking already completed' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(booking.email) as any;

    let userId: number;

    if (existingUser) {
      // Update existing user
      db.prepare(`
        UPDATE users 
        SET password = ?, 
            email_verified = TRUE,
            verification_token = NULL,
            token_expires_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(hashedPassword, existingUser.id);
      userId = existingUser.id;
    } else {
      // Create new user
      const insertUser = db.prepare(`
        INSERT INTO users (name, email, phone, address, password, email_verified)
        VALUES (?, ?, ?, ?, ?, TRUE)
      `);
      const result = insertUser.run(
        booking.name,
        booking.email,
        booking.phone,
        booking.address,
        hashedPassword
      );
      userId = result.lastInsertRowid as number;
    }

    // Update booking: set status to confirmed and link to user
    db.prepare(`
      UPDATE bookings 
      SET status = 'confirmed',
          user_id = ?,
          verification_token = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(userId, booking.id);

    // Send welcome email
    try {
      await sendWelcomeEmail({
        to: booking.email,
        name: booking.name,
        serviceType: booking.service_type,
        preferredDate: booking.preferred_date,
        preferredTime: booking.preferred_time,
        bookingId: booking.id.toString(),
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    // Auto-login: Create session token
    const userToken = createAdminToken({
      id: userId.toString(),
      email: booking.email,
      role: 'customer',
      name: booking.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created and booking confirmed!',
      data: {
        userId,
        bookingId: booking.id,
        email: booking.email,
      },
    });

    // Set auth cookie
    response.cookies.set('userToken', userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration completion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete registration' },
      { status: 500 }
    );
  }
}


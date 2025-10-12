import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/sqlite';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, serviceType, preferredDate, preferredTime, notes } = body;

    // Validation
    if (!name || !email || !phone || !address || !serviceType || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists with this email (and is verified)
    const existingUser = db.prepare('SELECT id, email_verified FROM users WHERE email = ?').get(email) as any;
    
    if (existingUser && existingUser.email_verified) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please login instead.' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create booking with pending_verification status
    const insertBooking = db.prepare(`
      INSERT INTO bookings (
        name, email, phone, address, service_type, preferred_date, preferred_time, 
        notes, status, verification_token
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_verification', ?)
    `);

    const result = insertBooking.run(
      name,
      email,
      phone,
      address,
      serviceType,
      preferredDate,
      preferredTime,
      notes || null,
      verificationToken
    );

    const bookingId = result.lastInsertRowid;

    // Send verification email
    try {
      await sendVerificationEmail({
        to: email,
        name,
        token: verificationToken,
        serviceType,
        preferredDate,
        preferredTime,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Rollback booking if email fails
      db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
      
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      data: {
        bookingId: bookingId.toString(),
        email,
      },
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}


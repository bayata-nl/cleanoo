import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 })
    }

    // Find staff by verification token
    const staff = db.prepare('SELECT * FROM staff WHERE verification_token = ?').get(token)

    if (!staff) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 400 })
    }

    const staffData = staff as any

    // Check if already verified
    if (staffData.email_verified) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email already verified',
        alreadyVerified: true,
        staffId: staffData.id
      })
    }

    // Update staff: mark as verified
    db.prepare(`
      UPDATE staff 
      SET email_verified = TRUE, 
          verified_at = CURRENT_TIMESTAMP,
          verification_token = NULL
      WHERE id = ?
    `).run(staffData.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully! Please complete your profile.',
      staffId: staffData.id,
      staffEmail: staffData.email
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}


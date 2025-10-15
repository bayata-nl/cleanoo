import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import bcrypt from 'bcryptjs'
import { createStaffToken, setStaffCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 })
    }

    const staff = db.prepare('SELECT * FROM staff WHERE email = ?').get(email.toLowerCase())
    if (!staff) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const staffData = staff as any

    const isValid = await bcrypt.compare(password, staffData.password)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if email is verified
    if (!staffData.email_verified) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please verify your email first. Check your inbox for the verification link.',
        requiresVerification: true
      }, { status: 403 })
    }

    // Check approval status
    if (staffData.approval_status !== 'approved') {
      const statusMessages: Record<string, string> = {
        'pending_info': 'Please complete your profile with required documents.',
        'pending_approval': 'Your application is pending admin approval. You will receive an email once approved.',
        'rejected': 'Your application has been rejected. Please contact admin for more information.'
      }
      
      return NextResponse.json({ 
        success: false, 
        error: statusMessages[staffData.approval_status as string] || 'Account not approved for login',
        approvalStatus: staffData.approval_status
      }, { status: 403 })
    }

    // Check if account is active
    if (staffData.status !== 'active') {
      return NextResponse.json({ 
        success: false, 
        error: 'Your account is currently inactive. Please contact admin.',
      }, { status: 403 })
    }

    const token = createStaffToken({ id: String(staffData.id), email: staffData.email, role: 'staff', name: staffData.name })
    const response = NextResponse.json({ success: true, user: { id: staffData.id, email: staffData.email, name: staffData.name } })
    setStaffCookie(response, token)
    return response
  } catch (error) {
    console.error('Staff login error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}





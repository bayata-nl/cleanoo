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

    const isValid = await bcrypt.compare(password, (staff as any).password)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const token = createStaffToken({ id: String((staff as any).id), email: (staff as any).email, role: 'staff', name: (staff as any).name })
    const response = NextResponse.json({ success: true, user: { id: (staff as any).id, email: (staff as any).email, name: (staff as any).name } })
    setStaffCookie(response, token)
    return response
  } catch (error) {
    console.error('Staff login error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}





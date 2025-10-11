import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, password } = body

    if (!name || !email || !phone || !address || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    const existing = db.prepare('SELECT id FROM staff WHERE email = ?').get(email.toLowerCase())
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const stmt = db.prepare(`
      INSERT INTO staff (name, email, phone, address, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(name, email.toLowerCase(), phone, address, hashedPassword, 'cleaner', 'active')

    const created = db.prepare('SELECT id, name, email, phone, address, role, status FROM staff WHERE id = ?').get(result.lastInsertRowid)

    return NextResponse.json({ success: true, data: created })
  } catch (error) {
    console.error('Staff self-register error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}





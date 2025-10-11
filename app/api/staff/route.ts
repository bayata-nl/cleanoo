import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import bcrypt from 'bcryptjs'
import { requireAdminJson } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    let query = 'SELECT * FROM staff WHERE 1=1'
    const params: any[] = []

    if (role) {
      query += ' AND role = ?'
      params.push(role)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC'

    const staff = db.prepare(query).all(...params)

    return NextResponse.json({ 
      success: true, 
      data: staff 
    })
  } catch (error) {
    console.error('Staff fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch staff' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdminJson(request)
    if (unauthorized) return unauthorized
    const body = await request.json()
    const { name, email, phone, address, password, role, status, specialization, experience_years, hourly_rate } = body

    // Validate required fields
    if (!name || !email || !phone || !role || !address) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, email, phone, address, and role are required' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingStaff = db.prepare('SELECT id FROM staff WHERE email = ?').get(email)
    if (existingStaff) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email already exists' 
      }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password || 'welcome', 10)

    const insertStaff = db.prepare(`
      INSERT INTO staff (name, email, phone, address, password, role, status, specialization, experience_years, hourly_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = insertStaff.run(
      name,
      email,
      phone,
      address,
      hashedPassword,
      role,
      status || 'active',
      specialization || null,
      experience_years || 0,
      hourly_rate || null
    )

    const newStaff = db.prepare('SELECT * FROM staff WHERE id = ?').get(result.lastInsertRowid)

    return NextResponse.json({ 
      success: true, 
      data: newStaff,
      message: 'Staff member created successfully' 
    })
  } catch (error) {
    console.error('Staff creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create staff member' 
    }, { status: 500 })
  }
}
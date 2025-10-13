import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const isAdmin = !!getAdminFromRequest(request)
    
    let query = 'SELECT * FROM bookings ORDER BY created_at DESC'
    let params: string[] = []
    
    if (email) {
      query = 'SELECT * FROM bookings WHERE email = ? ORDER BY created_at DESC'
      params = [email]
    } else if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    const stmt = db.prepare(query)
    const result = email ? stmt.all(params) : stmt.all()
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.name || !body.email || !body.phone || !body.address || !body.serviceType || !body.preferredDate || !body.preferredTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Check if user exists and get user_id
    let userId = null;
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(body.email.trim().toLowerCase());
    if (existingUser) {
      userId = (existingUser as any).id;
    }
    
    const query = `
      INSERT INTO bookings (name, email, phone, address, service_type, preferred_date, preferred_time, notes, status, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const values = [
      body.name.trim(),
      body.email.trim().toLowerCase(),
      body.phone.trim(),
      body.address.trim(),
      body.serviceType,
      body.preferredDate,
      body.preferredTime,
      body.notes?.trim() || null,
      'confirmed', // Logged-in users get confirmed booking
      userId
    ]
    
    const stmt = db.prepare(query)
    const result = stmt.run(values)
    
    // Get inserted record
    const inserted = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid)
    
    return NextResponse.json({ 
      success: true, 
      data: inserted,
      message: 'Booking successfully created'
    }, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

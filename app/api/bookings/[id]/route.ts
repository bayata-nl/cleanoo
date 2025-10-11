import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    
    const query = `
      UPDATE bookings 
      SET preferred_date = ?, preferred_time = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    
    const values = [
      body.preferredDate || body.preferred_date || new Date().toISOString().split('T')[0],
      body.preferredTime || body.preferred_time || 'Morning (8AM-12PM)',
      body.notes || null,
      (body.status || 'pending').toLowerCase(),
      id
    ]
    
    const stmt = db.prepare(query)
    const result = stmt.run(values)
    
    if (result.changes === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    // Güncellenmiş kaydı getir
    const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id)
    
    return NextResponse.json({ 
      success: true, 
      data: updated 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if booking exists
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id)
    
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    // Delete the booking (assignments will be deleted automatically due to CASCADE)
    const stmt = db.prepare('DELETE FROM bookings WHERE id = ?')
    const result = stmt.run(id)
    
    if (result.changes === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Booking deleted successfully' 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

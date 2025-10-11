import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staff_id = searchParams.get('staff_id')
    const team_id = searchParams.get('team_id')
    const is_read = searchParams.get('is_read')
    
    let query = `
      SELECT n.*,
             a.booking_id,
             a.assignment_type,
             a.status as assignment_status,
             b.service_type,
             b.preferred_date,
             b.preferred_time
      FROM assignment_notifications n
      LEFT JOIN assignments a ON n.assignment_id = a.id
      LEFT JOIN bookings b ON a.booking_id = b.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (staff_id) {
      query += ' AND n.staff_id = ?'
      params.push(staff_id)
    }
    
    if (team_id) {
      query += ' AND n.team_id = ?'
      params.push(team_id)
    }
    
    if (is_read !== null) {
      query += ' AND n.is_read = ?'
      params.push(is_read === 'true')
    }
    
    query += ' ORDER BY n.created_at DESC'
    
    const stmt = db.prepare(query)
    const result = stmt.all(params)
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notification_ids, is_read } = body
    
    if (!notification_ids || !Array.isArray(notification_ids)) {
      return NextResponse.json({
        success: false,
        error: 'notification_ids array is required'
      }, { status: 400 })
    }
    
    const placeholders = notification_ids.map(() => '?').join(',')
    const query = `
      UPDATE assignment_notifications 
      SET is_read = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
    `
    
    const params = [is_read, ...notification_ids]
    const stmt = db.prepare(query)
    stmt.run(params)
    
    return NextResponse.json({
      success: true,
      message: 'Notifications updated successfully'
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}



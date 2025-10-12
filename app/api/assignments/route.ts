import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { requireAdminJson } from '@/lib/auth'
import { sendAssignmentNotification } from '@/lib/email-notifications'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staff_id = searchParams.get('staff_id')
    const team_id = searchParams.get('team_id')
    const status = searchParams.get('status')
    const booking_id = searchParams.get('booking_id')
    
    let query = `
      SELECT a.*,
             b.name as customer_name,
             b.email as customer_email,
             b.phone as customer_phone,
             b.address as customer_address,
             b.service_type,
             b.preferred_date,
             b.preferred_time,
             b.notes as booking_notes,
             s.name as staff_name,
             s.email as staff_email,
             t.name as team_name,
             ab.name as assigned_by_name
      FROM assignments a
      JOIN bookings b ON a.booking_id = b.id
      LEFT JOIN staff s ON a.staff_id = s.id
      LEFT JOIN teams t ON a.team_id = t.id
      LEFT JOIN staff ab ON a.assigned_by = ab.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (staff_id) {
      query += ' AND a.staff_id = ?'
      params.push(staff_id)
    }
    
    if (team_id) {
      query += ' AND a.team_id = ?'
      params.push(team_id)
    }
    
    if (status) {
      query += ' AND a.status = ?'
      params.push(status)
    }
    
    if (booking_id) {
      query += ' AND a.booking_id = ?'
      params.push(booking_id)
    }
    
    query += ' ORDER BY a.assigned_at DESC'
    
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

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdminJson(request)
    if (unauthorized) return unauthorized
    const body = await request.json()
    
    // Validation
    if (!body.booking_id || !body.assignment_type) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: booking_id, assignment_type' 
      }, { status: 400 })
    }
    
    // Check if booking exists
    const booking = db.prepare('SELECT id, status FROM bookings WHERE id = ?').get(body.booking_id)
    if (!booking) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    // Check if booking already has an assignment
    const existingAssignment = db.prepare('SELECT id FROM assignments WHERE booking_id = ?').get(body.booking_id)
    if (existingAssignment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking already has an assignment' 
      }, { status: 400 })
    }
    
    // Validate assignment type and related fields
    if (body.assignment_type === 'team') {
      if (!body.team_id) {
        return NextResponse.json({ 
          success: false, 
          error: 'team_id is required for team assignments' 
        }, { status: 400 })
      }
      
      // Check if team exists and is active
      const team = db.prepare('SELECT id, status FROM teams WHERE id = ?').get(body.team_id)
      if (!team) {
        return NextResponse.json({ 
          success: false, 
          error: 'Team not found' 
        }, { status: 404 })
      }
      
      if ((team as any).status !== 'active') {
        return NextResponse.json({ 
          success: false, 
          error: 'Team is not active' 
        }, { status: 400 })
      }
    } else if (body.assignment_type === 'individual') {
      if (!body.staff_id) {
        return NextResponse.json({ 
          success: false, 
          error: 'staff_id is required for individual assignments' 
        }, { status: 400 })
      }
      
      // Check if staff exists and is active
      const staff = db.prepare('SELECT id, status FROM staff WHERE id = ?').get(body.staff_id)
      if (!staff) {
        return NextResponse.json({ 
          success: false, 
          error: 'Staff not found' 
        }, { status: 404 })
      }
      
      if ((staff as any).status !== 'active') {
        return NextResponse.json({ 
          success: false, 
          error: 'Staff is not active' 
        }, { status: 400 })
      }
    }
    
    // Set default assigned_by if not provided (admin user)
    const assignedBy = body.assigned_by || 1;
    
    const query = `
      INSERT INTO assignments (booking_id, team_id, staff_id, assigned_by, assignment_type, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    
    const values = [
      body.booking_id,
      body.team_id || null,
      body.staff_id || null,
      assignedBy,
      body.assignment_type,
      (body.status || 'assigned').toLowerCase(),
      body.notes?.trim() || null
    ]
    
    const stmt = db.prepare(query)
    const result = stmt.run(values)
    
    // Update booking status to 'assigned' when assigned
    db.prepare('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('assigned', body.booking_id)
    
    // Get the inserted record with staff/booking details
    const inserted = db.prepare(`
      SELECT a.*, b.service_type, b.name as customer_name, b.preferred_date, b.preferred_time, b.address,
             s.name as staff_name, s.email as staff_email
      FROM assignments a
      JOIN bookings b ON a.booking_id = b.id
      LEFT JOIN staff s ON a.staff_id = s.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid) as any;
    
    // Send email notification to assigned staff (fire and forget)
    if (inserted.staff_email) {
      sendAssignmentNotification({
        staffEmail: inserted.staff_email,
        staffName: inserted.staff_name,
        serviceType: inserted.service_type,
        customerName: inserted.customer_name,
        preferredDate: inserted.preferred_date,
        preferredTime: inserted.preferred_time,
        address: inserted.address,
      }).catch(err => console.error('Email notification failed:', err));
    }
    
    return NextResponse.json({ 
      success: true, 
      data: inserted,
      message: 'Assignment created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

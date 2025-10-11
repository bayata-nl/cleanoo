import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { requireAdminJson } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if assignment exists
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id)
    if (!assignment) {
      return NextResponse.json({
        success: false,
        error: 'Assignment not found'
      }, { status: 404 })
    }

    const oldStatus = (assignment as any).status
    const newStatus = body.status || oldStatus

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      'assigned': ['accepted', 'rejected', 'cancelled'],
      'accepted': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [], // Terminal state
      'cancelled': [], // Terminal state
      'rejected': ['assigned'] // Can be reassigned
    }

    if (oldStatus !== newStatus && !validTransitions[oldStatus]?.includes(newStatus)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status transition from ${oldStatus} to ${newStatus}`
      }, { status: 400 })
    }

    // Update assignment with proper timestamps
    let updateQuery = `
      UPDATE assignments
      SET status = ?, updated_at = CURRENT_TIMESTAMP
    `
    const updateValues: any[] = [newStatus]

    // Add timestamp fields based on status
    if (newStatus === 'accepted' && oldStatus === 'assigned') {
      updateQuery += ', accepted_at = CURRENT_TIMESTAMP'
    } else if (newStatus === 'in_progress' && oldStatus === 'accepted') {
      updateQuery += ', started_at = CURRENT_TIMESTAMP'
    } else if (newStatus === 'completed' && oldStatus === 'in_progress') {
      updateQuery += ', completed_at = CURRENT_TIMESTAMP'
    } else if (newStatus === 'rejected' && oldStatus === 'assigned') {
      updateQuery += ', rejected_at = CURRENT_TIMESTAMP, rejection_reason = ?'
      updateValues.push(body.rejection_reason || 'No reason provided')
    }

    // Add notes
    if (body.notes) {
      updateQuery += ', notes = ?'
      updateValues.push(body.notes)
    }
    if (body.admin_notes) {
      updateQuery += ', admin_notes = ?'
      updateValues.push(body.admin_notes)
    }
    if (body.staff_notes) {
      updateQuery += ', staff_notes = ?'
      updateValues.push(body.staff_notes)
    }

    updateQuery += ' WHERE id = ?'
    updateValues.push(id)

    const stmt = db.prepare(updateQuery)
    stmt.run(updateValues)

    // Record status change in history
    if (oldStatus !== newStatus) {
      const historyQuery = `
        INSERT INTO assignment_status_history (assignment_id, old_status, new_status, changed_by, change_reason)
        VALUES (?, ?, ?, ?, ?)
      `
      db.prepare(historyQuery).run(
        id,
        oldStatus,
        newStatus,
        body.changed_by || 1, // Default to admin
        body.change_reason || 'Status updated'
      )
    }

    // Create notification for staff
    if (newStatus === 'assigned' && oldStatus !== 'assigned') {
      const notificationQuery = `
        INSERT INTO assignment_notifications (assignment_id, staff_id, team_id, notification_type, message)
        VALUES (?, ?, ?, ?, ?)
      `
      const assignmentData = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id)
      const message = `New assignment created for you`
      
      if ((assignmentData as any).staff_id) {
        db.prepare(notificationQuery).run(id, (assignmentData as any).staff_id, null, 'new_assignment', message)
      } else if ((assignmentData as any).team_id) {
        // Get all team members
        const teamMembers = db.prepare('SELECT staff_id FROM team_members WHERE team_id = ?').all((assignmentData as any).team_id)
        teamMembers.forEach((member: any) => {
          db.prepare(notificationQuery).run(id, member.staff_id, (assignmentData as any).team_id, 'new_assignment', message)
        })
      }
    }

    // Update booking status based on assignment status
    if (newStatus) {
      let bookingStatus = 'assigned'
      if (newStatus === 'completed') {
        bookingStatus = 'completed'
      } else if (newStatus === 'cancelled' || newStatus === 'rejected') {
        bookingStatus = 'cancelled'
      } else if (newStatus === 'in_progress') {
        bookingStatus = 'in_progress'
      }

      db.prepare('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT booking_id FROM assignments WHERE id = ?)').run(bookingStatus, id)
    }

    // Get updated record
    const updated = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id)

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Assignment updated successfully'
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = requireAdminJson(request)
    if (unauthorized) return unauthorized
    const { id } = await params
    
    // Check if assignment exists
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id)
    if (!assignment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Assignment not found' 
      }, { status: 404 })
    }
    
    // Reset booking status to pending
    db.prepare('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('pending', (assignment as any).booking_id)
    
    // Delete assignment
    db.prepare('DELETE FROM assignments WHERE id = ?').run(id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Assignment deleted successfully'
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

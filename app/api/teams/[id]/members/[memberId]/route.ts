import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { requireAdminJson } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string, memberId: string }> }) {
  try {
    const unauthorized = requireAdminJson(request)
    if (unauthorized) return unauthorized
    const { id, memberId } = await params
    const body = await request.json()
    
    // Check if team member exists
    const existing = db.prepare('SELECT id FROM team_members WHERE id = ? AND team_id = ?').get(memberId, id)
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team member not found' 
      }, { status: 404 })
    }
    
    const query = `
      UPDATE team_members 
      SET role_in_team = COALESCE(?, role_in_team)
      WHERE id = ? AND team_id = ?
    `
    
    const values = [body.role_in_team || null, memberId, id]
    
    const stmt = db.prepare(query)
    stmt.run(values)
    
    // Get the updated record
    const updated = db.prepare(`
      SELECT tm.*, 
             s.name as staff_name,
             s.email as staff_email,
             s.role as staff_role
      FROM team_members tm
      JOIN staff s ON tm.staff_id = s.id
      WHERE tm.id = ?
    `).get(memberId)
    
    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: 'Team member updated successfully'
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, memberId: string }> }) {
  try {
    const unauthorized = requireAdminJson(request)
    if (unauthorized) return unauthorized
    const { id, memberId } = await params
    
    // Check if team member exists
    const existing = db.prepare('SELECT id FROM team_members WHERE id = ? AND team_id = ?').get(memberId, id)
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team member not found' 
      }, { status: 404 })
    }
    
    // Check if this member has active assignments
    const member = db.prepare('SELECT staff_id FROM team_members WHERE id = ?').get(memberId)
    if (member) {
      const assignments = db.prepare('SELECT COUNT(*) as count FROM assignments WHERE staff_id = ? AND status IN (?, ?, ?)').get((member as any).staff_id, 'assigned', 'accepted', 'in_progress')
      if ((assignments as any).count > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot remove team member with active assignments' 
        }, { status: 400 })
      }
    }
    
    // Remove team member
    db.prepare('DELETE FROM team_members WHERE id = ? AND team_id = ?').run(memberId, id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Team member removed successfully'
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

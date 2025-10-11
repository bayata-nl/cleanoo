import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { requireAdminJson } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Get team details
    const teamQuery = `
      SELECT t.*, 
             s.name as team_leader_name,
             s.email as team_leader_email
      FROM teams t
      LEFT JOIN staff s ON t.team_leader_id = s.id
      WHERE t.id = ?
    `
    
    const teamStmt = db.prepare(teamQuery)
    const team = teamStmt.get(id)
    
    if (!team) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team not found' 
      }, { status: 404 })
    }
    
    // Get team members
    const membersQuery = `
      SELECT tm.*, 
             s.name as staff_name,
             s.email as staff_email,
             s.role as staff_role,
             s.specialization,
             s.experience_years
      FROM team_members tm
      JOIN staff s ON tm.staff_id = s.id
      WHERE tm.team_id = ?
      ORDER BY tm.role_in_team DESC, s.name ASC
    `
    
    const membersStmt = db.prepare(membersQuery)
    const members = membersStmt.all(id)
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...team,
        members
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = requireAdminJson(request)
    if (unauthorized) return unauthorized
    const { id } = await params
    const body = await request.json()
    
    // Check if team exists
    const existing = db.prepare('SELECT id FROM teams WHERE id = ?').get(id)
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team not found' 
      }, { status: 404 })
    }
    
    // Check if team name already exists (excluding current team)
    if (body.name) {
      const nameExists = db.prepare('SELECT id FROM teams WHERE name = ? AND id != ?').get(body.name, id)
      if (nameExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'Team name already exists' 
        }, { status: 400 })
      }
    }
    
    // Validate team leader if provided
    if (body.team_leader_id) {
      const teamLeader = db.prepare('SELECT id, role FROM personnel WHERE id = ? AND status = ?').get(body.team_leader_id, 'active')
      if (!teamLeader) {
        return NextResponse.json({ 
          success: false, 
          error: 'Team leader not found or inactive' 
        }, { status: 400 })
      }
      
      // Only supervisors and managers can be team leaders
      if (!['supervisor', 'manager'].includes((teamLeader as any).role)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Only supervisors and managers can be team leaders' 
        }, { status: 400 })
      }
    }
    
    const query = `
      UPDATE teams 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          team_leader_id = COALESCE(?, team_leader_id),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    
    const values = [
      body.name?.trim() || null,
      body.description?.trim() || null,
      body.team_leader_id || null,
      body.status || null,
      id
    ]
    
    const stmt = db.prepare(query)
    stmt.run(values)
    
    // Get the updated record
    const updated = db.prepare('SELECT * FROM teams WHERE id = ?').get(id)
    
    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: 'Team updated successfully'
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
    
    // Check if team exists
    const existing = db.prepare('SELECT id FROM teams WHERE id = ?').get(id)
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team not found' 
      }, { status: 404 })
    }
    
    // Check if team has active assignments
    const assignments = db.prepare('SELECT COUNT(*) as count FROM assignments WHERE team_id = ? AND status IN ("assigned", "accepted", "in_progress")').get(id)
    if ((assignments as any).count > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete team with active assignments' 
      }, { status: 400 })
    }
    
    // Delete team (team_members will be deleted automatically due to CASCADE)
    db.prepare('DELETE FROM teams WHERE id = ?').run(id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Team deleted successfully'
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

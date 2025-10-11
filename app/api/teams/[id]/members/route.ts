import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { requireAdminJson } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Check if team exists
    const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(id)
    if (!team) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team not found' 
      }, { status: 404 })
    }
    
    const query = `
      SELECT tm.*, 
             s.name as staff_name,
             s.email as staff_email,
             s.role as staff_role,
             s.specialization,
             s.experience_years,
             s.status as staff_status
      FROM team_members tm
      JOIN staff s ON tm.staff_id = s.id
      WHERE tm.team_id = ?
      ORDER BY tm.role_in_team DESC, s.name ASC
    `
    
    const stmt = db.prepare(query)
    const result = stmt.all(id)
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = requireAdminJson(request)
    if (unauthorized) return unauthorized
    const { id } = await params
    const body = await request.json()
    
    // Check if team exists
    const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(id)
    if (!team) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team not found' 
      }, { status: 404 })
    }
    
    // Validation
    if (!body.staff_id || !body.role_in_team) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: staff_id, role_in_team' 
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
    
    // Check if staff is already in this team
    const existingMember = db.prepare('SELECT id FROM team_members WHERE team_id = ? AND staff_id = ?').get(id, body.staff_id)
    if (existingMember) {
      return NextResponse.json({ 
        success: false, 
        error: 'Staff is already a member of this team' 
      }, { status: 400 })
    }
    
    // Check if staff is already a member of another team
    const otherTeam = db.prepare('SELECT team_id FROM team_members WHERE staff_id = ?').get(body.staff_id)
    if (otherTeam) {
      return NextResponse.json({ 
        success: false, 
        error: 'Staff is already a member of another team' 
      }, { status: 400 })
    }
    
    const query = `
      INSERT INTO team_members (team_id, staff_id, role_in_team)
      VALUES (?, ?, ?)
    `
    
    const values = [id, body.staff_id, body.role_in_team]
    
    const stmt = db.prepare(query)
    const result = stmt.run(values)
    
    // Get the inserted record with staff details
    const inserted = db.prepare(`
      SELECT tm.*, 
             s.name as staff_name,
             s.email as staff_email,
             s.role as staff_role
      FROM team_members tm
      JOIN staff s ON tm.staff_id = s.id
      WHERE tm.id = ?
    `).get(result.lastInsertRowid)
    
    return NextResponse.json({ 
      success: true, 
      data: inserted,
      message: 'Team member added successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

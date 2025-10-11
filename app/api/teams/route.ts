import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { requireAdminJson } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const staff_id = searchParams.get('staff_id')
    
    // Get teams with basic info
    let query = `
      SELECT t.*, 
             s.name as team_leader_name,
             s.email as team_leader_email
      FROM teams t
      LEFT JOIN staff s ON t.team_leader_id = s.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (status) {
      query += ' AND t.status = ?'
      params.push(status)
    }
    
    // If staff_id is provided, only return teams where this staff is a member
    if (staff_id) {
      query = `
        SELECT DISTINCT t.*, 
               s.name as team_leader_name,
               s.email as team_leader_email
        FROM teams t
        LEFT JOIN staff s ON t.team_leader_id = s.id
        JOIN team_members tm ON t.id = tm.team_id
        WHERE tm.staff_id = ?
      `
      params.push(staff_id)
      
      if (status) {
        query += ' AND t.status = ?'
        params.push(status)
      }
    }
    
    query += ' ORDER BY t.created_at DESC'
    
    const stmt = db.prepare(query)
    const teams = stmt.all(params)
    
    // Get members for each team
    const memberQuery = `
      SELECT tm.*, 
             s.name as staff_name,
             s.email as staff_email,
             s.role as staff_role,
             s.specialization as staff_specialization
      FROM team_members tm
      LEFT JOIN staff s ON tm.staff_id = s.id
      WHERE tm.team_id = ?
      ORDER BY tm.role_in_team DESC, s.name ASC
    `
    const memberStmt = db.prepare(memberQuery)
    
    const teamsWithMembers = teams.map((team: any) => {
      const members = memberStmt.all(team.id)
      return {
        ...team,
        members: members.map((member: any) => ({
          id: member.id,
          team_id: member.team_id,
          staff_id: member.staff_id,
          role_in_team: member.role_in_team,
          joined_at: member.joined_at,
          staff: {
            name: member.staff_name,
            email: member.staff_email,
            role: member.staff_role,
            specialization: member.staff_specialization
          }
        })),
        member_count: members.length
      }
    })
    
    return NextResponse.json({ success: true, data: teamsWithMembers })
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
    if (!body.name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required field: name' 
      }, { status: 400 })
    }
    
    // Check if team name already exists
    const existingTeam = db.prepare('SELECT id FROM teams WHERE name = ?').get(body.name)
    if (existingTeam) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team name already exists' 
      }, { status: 400 })
    }
    
    // Validate team leader if provided
    if (body.team_leader_id) {
      const teamLeader = db.prepare('SELECT id, role FROM staff WHERE id = ? AND status = ?').get(body.team_leader_id, 'active')
      if (!teamLeader) {
        return NextResponse.json({ 
          success: false, 
          error: 'Team leader not found or inactive' 
        }, { status: 400 })
      }
      
      if (!['supervisor', 'manager'].includes((teamLeader as any).role)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Team leader must be a supervisor or manager' 
        }, { status: 400 })
      }
    }
    
    const query = `
      INSERT INTO teams (name, description, team_leader_id, status)
      VALUES (?, ?, ?, ?)
    `
    
    const values = [
      body.name.trim(),
      body.description?.trim() || null,
      body.team_leader_id || null,
      body.status || 'active'
    ]
    
    const stmt = db.prepare(query)
    const result = stmt.run(values)
    
    // Get the inserted record
    const inserted = db.prepare('SELECT * FROM teams WHERE id = ?').get(result.lastInsertRowid)
    
    return NextResponse.json({ 
      success: true, 
      data: inserted,
      message: 'Team created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

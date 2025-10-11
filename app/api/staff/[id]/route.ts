import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import bcrypt from 'bcryptjs'
import { requireAdminJson } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const staffId = parseInt(id)

    if (isNaN(staffId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid staff ID' 
      }, { status: 400 })
    }

    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId)

    if (!staff) {
      return NextResponse.json({ 
        success: false, 
        error: 'Staff member not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: staff 
    })
  } catch (error) {
    console.error('Staff fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch staff member' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = requireAdminJson(request)
    if (unauthorized) return unauthorized
    const { id } = await params
    const staffId = parseInt(id)
    const body = await request.json()

    if (isNaN(staffId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid staff ID' 
      }, { status: 400 })
    }

    // Check if staff exists
    const existingStaff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId)
    if (!existingStaff) {
      return NextResponse.json({ 
        success: false, 
        error: 'Staff member not found' 
      }, { status: 404 })
    }

    const { name, email, phone, address, password, role, status, specialization, experience_years, hourly_rate } = body

    // Check if email is being changed and if it already exists
    if (email && email !== (existingStaff as any).email) {
      const emailExists = db.prepare('SELECT id FROM staff WHERE email = ? AND id != ?').get(email, staffId)
      if (emailExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email already exists' 
        }, { status: 400 })
      }
    }

    let newPasswordHash: string | undefined
    if (password) {
      newPasswordHash = await bcrypt.hash(password, 10)
    }

    const updateStaff = db.prepare(`
      UPDATE staff 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          password = COALESCE(?, password),
          role = COALESCE(?, role),
          status = COALESCE(?, status),
          specialization = COALESCE(?, specialization),
          experience_years = COALESCE(?, experience_years),
          hourly_rate = COALESCE(?, hourly_rate),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    updateStaff.run(
      name,
      email,
      phone,
      address,
      newPasswordHash,
      role,
      status,
      specialization,
      experience_years,
      hourly_rate,
      staffId
    )

    const updatedStaff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId)

    return NextResponse.json({ 
      success: true, 
      data: updatedStaff,
      message: 'Staff member updated successfully' 
    })
  } catch (error) {
    console.error('Staff update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update staff member' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const staffId = parseInt(id)

    if (isNaN(staffId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid staff ID' 
      }, { status: 400 })
    }

    // Check if staff exists
    const existingStaff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId)
    if (!existingStaff) {
      return NextResponse.json({ 
        success: false, 
        error: 'Staff member not found' 
      }, { status: 404 })
    }

    // Check if staff is assigned to any teams
    const teamAssignments = db.prepare('SELECT COUNT(*) as count FROM team_members WHERE staff_id = ?').get(staffId)
    if ((teamAssignments as any).count > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete staff member who is assigned to teams. Remove from teams first.' 
      }, { status: 400 })
    }

    // Check if staff has any assignments
    const assignments = db.prepare('SELECT COUNT(*) as count FROM assignments WHERE staff_id = ? OR assigned_by = ?').get(staffId, staffId)
    if ((assignments as any).count > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete staff member who has assignments. Complete or reassign tasks first.' 
      }, { status: 400 })
    }

    const deleteStaff = db.prepare('DELETE FROM staff WHERE id = ?')
    deleteStaff.run(staffId)

    return NextResponse.json({ 
      success: true, 
      message: 'Staff member deleted successfully' 
    })
  } catch (error) {
    console.error('Staff deletion error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete staff member' 
    }, { status: 500 })
  }
}
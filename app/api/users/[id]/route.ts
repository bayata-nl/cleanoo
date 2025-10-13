import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import bcrypt from 'bcryptjs'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userJwt = getUserFromRequest(request)
    if (!userJwt) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)

    // Users can only view their own profile
    if (parseInt(userJwt.id) !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const user = db.prepare('SELECT id, name, email, phone, address, email_verified, created_at FROM users WHERE id = ?').get(userId)

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: user 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userJwt = getUserFromRequest(request)
    if (!userJwt) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)

    // Users can only update their own profile
    if (parseInt(userJwt.id) !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, phone, address, email, password } = body

    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Check if email is being changed and if it already exists
    if (email && email !== (existingUser as any).email) {
      const emailExists = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId)
      if (emailExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email already exists' 
        }, { status: 400 })
      }
    }

    let newPasswordHash: string | undefined
    if (password && String(password).trim().length >= 6) {
      newPasswordHash = await bcrypt.hash(password, 10)
    }

    const updateUser = db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          password = COALESCE(?, password),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    updateUser.run(
      name,
      email,
      phone,
      address,
      newPasswordHash,
      userId
    )

    const updatedUser = db.prepare('SELECT id, name, email, phone, address, email_verified, created_at FROM users WHERE id = ?').get(userId)

    return NextResponse.json({ 
      success: true, 
      data: updatedUser,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update profile' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userJwt = getUserFromRequest(request)
    if (!userJwt) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)

    // Users can only delete their own account
    if (parseInt(userJwt.id) !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(userId)

    if (result.changes === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete account' 
    }, { status: 500 })
  }
}


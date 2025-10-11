import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import bcrypt from 'bcryptjs'
import { getStaffFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const staffJwt = getStaffFromRequest(request)
  if (!staffJwt) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const staff = db.prepare('SELECT id, name, email, phone, address, role, status, specialization, experience_years, hourly_rate FROM staff WHERE id = ?').get(parseInt(staffJwt.id))
  if (!staff) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: staff })
}

export async function PUT(request: NextRequest) {
  const staffJwt = getStaffFromRequest(request)
  if (!staffJwt) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const staffId = parseInt(staffJwt.id)
  const body = await request.json()
  const { name, phone, address, specialization, experience_years, hourly_rate, password } = body

  let newPasswordHash: string | undefined
  if (password && String(password).trim().length >= 6) {
    newPasswordHash = await bcrypt.hash(password, 10)
  }

  const stmt = db.prepare(`
    UPDATE staff SET
      name = COALESCE(?, name),
      phone = COALESCE(?, phone),
      address = COALESCE(?, address),
      specialization = COALESCE(?, specialization),
      experience_years = COALESCE(?, experience_years),
      hourly_rate = COALESCE(?, hourly_rate),
      password = COALESCE(?, password),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  stmt.run(
    name,
    phone,
    address,
    specialization,
    experience_years,
    hourly_rate,
    newPasswordHash,
    staffId
  )

  const updated = db.prepare('SELECT id, name, email, phone, address, role, status, specialization, experience_years, hourly_rate FROM staff WHERE id = ?').get(staffId)
  return NextResponse.json({ success: true, data: updated })
}





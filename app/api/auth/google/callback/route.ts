import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { setAdminCookie, setStaffCookie } from '@/lib/auth'

function getEnvOrThrow(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`${key} is not set`)
  return v
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const stateCookie = request.cookies.get('oauth_state')?.value
    if (!code || !state || !stateCookie || state !== stateCookie) {
      return NextResponse.json({ success: false, error: 'Invalid OAuth state' }, { status: 400 })
    }

    const clientId = getEnvOrThrow('GOOGLE_CLIENT_ID')
    const clientSecret = getEnvOrThrow('GOOGLE_CLIENT_SECRET')
    const redirectUri = getEnvOrThrow('GOOGLE_REDIRECT_URI')

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })
    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      return NextResponse.json({ success: false, error: `Token error: ${err}` }, { status: 400 })
    }
    const tokenJson = await tokenRes.json()
    const idToken = tokenJson.id_token as string

    // Parse ID token
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf8'))
    const email = (payload.email || '').toLowerCase()
    const name = payload.name || email.split('@')[0] || 'User'

    // Strategy: if email matches admin, set admin cookie; else ensure staff exists and set staff cookie
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
    const response = NextResponse.redirect(new URL('/', request.url))

    if (adminEmail && email === adminEmail) {
      const { createAdminToken } = await import('@/lib/auth')
      const token = createAdminToken({ id: '1', email, role: 'admin', name })
      setAdminCookie(response, token)
      response.headers.set('Location', '/admin')
      return response
    }

    // Upsert staff by email
    let staff = db.prepare('SELECT * FROM staff WHERE email = ?').get(email)
    if (!staff) {
      const insert = db.prepare('INSERT INTO staff (name, email, phone, address, role, status) VALUES (?, ?, ?, ?, ?, ?)')
      const result = insert.run(name, email, '', '', 'cleaner', 'active')
      staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(result.lastInsertRowid)
    }

    const { createStaffToken } = await import('@/lib/auth')
    const token = createStaffToken({ id: String((staff as any).id), email, role: 'staff', name })
    setStaffCookie(response, token)
    response.headers.set('Location', '/staff/dashboard')
    return response
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'OAuth callback error' }, { status: 500 })
  }
}





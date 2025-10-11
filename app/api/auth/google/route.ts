import { NextRequest, NextResponse } from 'next/server'

function getEnvOrThrow(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`${key} is not set`)
  return v
}

function generateState(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getEnvOrThrow('GOOGLE_CLIENT_ID')
    const redirectUri = getEnvOrThrow('GOOGLE_REDIRECT_URI')

    const state = generateState()

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'openid email profile')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('include_granted_scopes', 'true')
    authUrl.searchParams.set('state', state)

    const res = NextResponse.redirect(authUrl.toString())
    res.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    })
    return res
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'OAuth init error' }, { status: 500 })
  }
}





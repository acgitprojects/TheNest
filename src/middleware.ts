import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

const PUBLIC_PATHS = ['/', '/login']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public pages
  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next()
  }

  // Allow the login API
  if (pathname === '/api/auth/login') {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, sessionOptions)

  if (!session.isLoggedIn) {
    // API routes return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '未登入' }, { status: 401 })
    }
    // Pages redirect to login
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/calendar/:path*',
    '/logbook/:path*',
    '/confirmation/:path*',
    '/api/bookings/:path*',
    '/api/hosts/:path*',
    '/api/slots/:path*',
    '/api/auth/logout',
  ],
}

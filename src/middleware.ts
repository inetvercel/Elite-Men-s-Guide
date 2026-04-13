import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware: handles trailing-slash normalisation and WordPress permalink compatibility.
 * All WP posts were stored with their exact permalink path (e.g. /my-post/).
 * Next.js routes them via [...slug], but we normalise the path here.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next internals, static files, studio
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

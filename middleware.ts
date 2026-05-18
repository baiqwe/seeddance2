import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)
const APEX_HOSTNAME = 'seedance2video.cc'
const WWW_HOSTNAME = 'www.seedance2video.cc'
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0'])

export async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname
  const forwardedProto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')

  if (!LOCAL_HOSTNAMES.has(hostname) && hostname === APEX_HOSTNAME) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.hostname = WWW_HOSTNAME
    redirectUrl.protocol = 'https:'
    redirectUrl.port = ''
    return NextResponse.redirect(redirectUrl, 301)
  }

  if (!LOCAL_HOSTNAMES.has(hostname) && hostname === WWW_HOSTNAME && forwardedProto !== 'https') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.protocol = 'https:'
    redirectUrl.port = ''
    return NextResponse.redirect(redirectUrl, 301)
  }

  const duplicateLocaleMatch = request.nextUrl.pathname.match(/^\/(en|zh)(?:\/(en|zh))+?(?=\/|$)/)
  if (duplicateLocaleMatch) {
    const normalizedPathname = request.nextUrl.pathname.replace(/^\/(en|zh)(?:\/(?:en|zh))+/, `/${duplicateLocaleMatch[1]}`)
    const normalizedUrl = request.nextUrl.clone()
    normalizedUrl.pathname = normalizedPathname || `/${duplicateLocaleMatch[1]}`
    return NextResponse.redirect(normalizedUrl, 307)
  }

  return intlMiddleware(request)
}

export const config = {
  // Exclude auth route handlers so next-intl does not prefix them with /en or /zh.
  matcher: ['/((?!api|_next|_vercel|auth/callback|auth/google|.*\\..*).*)', '/(en|zh)/:path*']
}

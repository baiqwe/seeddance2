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
  const isLocalHost = LOCAL_HOSTNAMES.has(hostname)
  const redirectUrl = request.nextUrl.clone()
  let shouldCanonicalRedirect = false

  if (!isLocalHost && request.nextUrl.pathname === '/' && (hostname === APEX_HOSTNAME || hostname === WWW_HOSTNAME)) {
    redirectUrl.hostname = WWW_HOSTNAME
    redirectUrl.protocol = 'https:'
    redirectUrl.port = ''
    redirectUrl.pathname = '/en'
    return NextResponse.redirect(redirectUrl, 308)
  }

  if (!isLocalHost && request.nextUrl.pathname === '/sitemap.xml') {
    redirectUrl.pathname = '/xml/sitemap.xml'
    shouldCanonicalRedirect = true
  }

  if (!isLocalHost && request.nextUrl.pathname === '/page-sitemap.xml') {
    redirectUrl.pathname = '/xml/page-sitemap.xml'
    shouldCanonicalRedirect = true
  }

  if (!isLocalHost && request.nextUrl.pathname === '/video-sitemap.xml') {
    redirectUrl.pathname = '/xml/video-sitemap.xml'
    shouldCanonicalRedirect = true
  }

  if (!isLocalHost && hostname === APEX_HOSTNAME) {
    redirectUrl.hostname = WWW_HOSTNAME
    redirectUrl.protocol = 'https:'
    redirectUrl.port = ''
    shouldCanonicalRedirect = true
  }

  if (!isLocalHost && hostname === WWW_HOSTNAME && forwardedProto !== 'https') {
    redirectUrl.protocol = 'https:'
    redirectUrl.port = ''
    shouldCanonicalRedirect = true
  }

  if (shouldCanonicalRedirect) {
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
  matcher: [
    '/((?!api|_next|_vercel|auth/callback|auth/google|.*\\..*).*)',
    '/(en|zh)/:path*',
    '/sitemap.xml',
    '/page-sitemap.xml',
    '/video-sitemap.xml',
    '/robots.txt',
    '/xml/:path*',
  ]
}

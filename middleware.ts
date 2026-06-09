import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)
const APEX_HOSTNAME = 'seedance2video.cc'
const WWW_HOSTNAME = 'www.seedance2video.cc'
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0'])
const SEO_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
const PUBLIC_STATIC_SEGMENTS = new Set([
  '',
  'about',
  'contact',
  'guide',
  'guides',
  'pricing',
  'privacy',
  'terms',
])
const NON_SEO_SEGMENTS = new Set([
  'creative-center',
  'dashboard',
  'forgot-password',
  'reset-password',
  'sign-in',
  'sign-up',
  'video',
])

function isPublicSeoPage(pathname: string) {
  const match = pathname.match(/^\/(en|zh)(?:\/([^/?#]+))?\/?$/)
  if (!match) return false
  const segment = match[2] || ''
  if (NON_SEO_SEGMENTS.has(segment)) return false
  return PUBLIC_STATIC_SEGMENTS.has(segment) || Boolean(segment)
}

function withSeoCacheHeaders(response: NextResponse, pathname: string) {
  if (isPublicSeoPage(pathname)) {
    response.headers.set('Cache-Control', SEO_CACHE_CONTROL)
  }
  return response
}

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

  return withSeoCacheHeaders(intlMiddleware(request), request.nextUrl.pathname)
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

// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routen, die Authentifizierung erfordern
const PROTECTED_ROUTES = [
  "/dashboard",
  "/fahndungen/neu",
  "/fahndungen/verwaltung",
];
// Routen, die für authentifizierte User gesperrt sind (z.B. Login)
const AUTH_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Prüfe auf TYPO3 Session Cookie
  // Hinweis: Dies prüft nur die Existenz, nicht die Gültigkeit (das macht das Backend/Hook)
  const hasSessionCookie = request.cookies.has("fe_typo_user");

  // 2. Prüfe ob es eine geschützte Route ist (inkl. dynamische Routes)
  const isProtectedRoute =
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.match(/^\/fahndungen\/[^/]+\/edit$/);

  if (isProtectedRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Redirect für Auth Routes (wenn schon eingeloggt)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico)).*)",
  ],
};

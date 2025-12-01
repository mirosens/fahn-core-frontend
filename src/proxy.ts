// proxy.ts - Edge-Proxy für geschützte Routen (Next.js 16)
// Ersetzt die deprecated middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/fahndungen/neu",
  "/fahndungen/verwaltung",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prüfe ob der Pfad geschützt ist
  const isProtected =
    PROTECTED_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.match(/^\/fahndungen\/[^/]+\/edit$/);

  if (!isProtected) {
    return NextResponse.next();
  }

  // Prüfe auf auth_token Cookie
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    // Redirect zu Login mit Return-URL
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/fahndungen/neu",
    "/fahndungen/verwaltung/:path*",
    "/fahndungen/:id/edit",
  ],
};

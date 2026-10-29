import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, sessionCookieName } from "@/lib/auth/session-token";

const loginPath = "/admin/login";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === loginPath) return NextResponse.next();
  const hasSession = Boolean(readSessionToken(request.cookies.get(sessionCookieName)?.value));
  if (!hasSession) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

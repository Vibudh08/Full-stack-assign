import { NextResponse, type NextRequest } from "next/server";

import { SESSION_MARKER_COOKIE_NAME } from "@/lib/auth-constants";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_MARKER_COOKIE_NAME);
  const isAuthRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/register";

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/login", "/register"],
};

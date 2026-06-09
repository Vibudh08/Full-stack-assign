import { NextResponse, type NextRequest } from "next/server";

import { SESSION_MARKER_COOKIE_NAME } from "@/lib/auth-constants";

export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_MARKER_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*"],
};

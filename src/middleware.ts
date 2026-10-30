import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (!path.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const host = req.headers.get("host") || req.headers.get("x-forwarded-host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";

  const requestHeaders = new Headers(req.headers);
  if (host) {
    requestHeaders.set("x-forwarded-host", host);
    requestHeaders.set("x-forwarded-proto", proto);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/auth/:path*"],
};

import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminToken,
} from "./lib/auth/admin-token";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware({
  ...routing,
  localeDetection: false,
});

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/uploads/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (token) {
        const session = await verifyAdminToken(token);
        if (session) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
      return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token || !(await verifyAdminToken(token))) {
      const login = new URL("/admin/login", request.url);
      if (pathname !== "/admin") {
        login.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(ar|de|en)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};

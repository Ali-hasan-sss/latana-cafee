import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** English when the user has not chosen a locale (no cookie / no prefixed URL). */
export default createMiddleware({
  ...routing,
  localeDetection: false,
});

export const config = {
  matcher: ["/", "/(ar|de|en)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};

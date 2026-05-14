import { headers } from "next/headers";

/**
 * Resolves whether auth-related cookies should use the `Secure` attribute.
 *
 * `Secure` must only be set when the client actually uses HTTPS; otherwise the
 * browser may drop the cookie. Behind nginx, rely on `X-Forwarded-Proto` (see
 * `.env.example`). Forcing `secure: true` whenever `NODE_ENV === "production"`
 * breaks setups where the Node process only sees HTTP from the proxy.
 *
 * Override with `AUTH_SESSION_COOKIE_SECURE=1` or `=0`.
 */
export async function resolveCookieSecureFlag(): Promise<boolean> {
  const raw = process.env.AUTH_SESSION_COOKIE_SECURE?.trim().toLowerCase();
  if (raw === "1" || raw === "true" || raw === "yes") return true;
  if (raw === "0" || raw === "false" || raw === "no") return false;

  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  const proto =
    (await headers()).get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (proto === "https") return true;
  if (proto === "http") return false;

  // Production but proto missing / unknown: avoid Secure so login still works
  // when the proxy omits X-Forwarded-Proto (fix nginx when you can).
  return false;
}

import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const ADMIN_SESSION_COOKIE = "admin_session";

function getSecret(): Uint8Array | null {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    return null;
  }
  return new TextEncoder().encode(s);
}

export async function signAdminToken(userId: string): Promise<string | null> {
  const secret = getSecret();
  if (!secret) {
    return null;
  }
  return new SignJWT({ role: "admin" })
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminToken(
  token: string,
): Promise<{ userId: string } | null> {
  const secret = getSecret();
  if (!secret) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin" || typeof payload.sub !== "string") {
      return null;
    }
    return { userId: payload.sub };
  } catch {
    return null;
  }
}

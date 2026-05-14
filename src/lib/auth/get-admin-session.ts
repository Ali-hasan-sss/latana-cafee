import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "./admin-token";

export async function getAdminSession(): Promise<{ userId: string } | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifyAdminToken(token);
}

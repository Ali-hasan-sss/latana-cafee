import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "@/lib/auth/admin-token";

/** Lets the public site show lightweight “edit” UI only for signed-in admins. */
export async function GET() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  const ok = Boolean(token && (await verifyAdminToken(token)));
  return NextResponse.json({ ok });
}

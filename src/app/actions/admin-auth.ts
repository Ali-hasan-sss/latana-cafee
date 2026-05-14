"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  signAdminToken,
} from "@/lib/auth/admin-token";
import { connectDB } from "@/lib/db/connect";
import AdminUser from "@/lib/models/AdminUser";

export type AdminLoginState = { error: string } | null;

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const username = (formData.get("username")?.toString() ?? "").trim().toLowerCase();
  const password = formData.get("password")?.toString() ?? "";

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  await connectDB();
  const user = await AdminUser.findOne({ username }).lean();
  if (!user?.passwordHash) {
    return { error: "Invalid username or password." };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: "Invalid username or password." };
  }

  const token = await signAdminToken(String(user._id));
  if (!token) {
    return {
      error:
        "AUTH_SECRET is missing or too short (min 16 characters). Check server configuration.",
    };
  }

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function adminLogout(_formData: FormData): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

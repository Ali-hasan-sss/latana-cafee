"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";
import { ADMIN_UI_LOCALE_COOKIE, isAdminUiLocale, type AdminUiLocale } from "@/lib/admin/get-admin-locale";

export async function setAdminUiLocale(locale: string) {
  const next: AdminUiLocale = isAdminUiLocale(locale) ? locale : routing.defaultLocale;
  const store = await cookies();
  store.set(ADMIN_UI_LOCALE_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/login", "page");
}

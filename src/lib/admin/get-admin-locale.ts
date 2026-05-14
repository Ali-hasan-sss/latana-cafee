import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";

export const ADMIN_UI_LOCALE_COOKIE = "ADMIN_UI_LOCALE";

export type AdminUiLocale = (typeof routing.locales)[number];

export function isAdminUiLocale(value: string | undefined): value is AdminUiLocale {
  return !!value && routing.locales.includes(value as AdminUiLocale);
}

export async function getAdminLocale(): Promise<AdminUiLocale> {
  const raw = (await cookies()).get(ADMIN_UI_LOCALE_COOKIE)?.value;
  if (isAdminUiLocale(raw)) return raw;
  return routing.defaultLocale;
}

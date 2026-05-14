import type { Metadata } from "next";
import { getAdminLocale } from "@/lib/admin/get-admin-locale";
import { getAdminTranslator } from "@/lib/admin/admin-i18n";

const metaKeys = [
  "overview",
  "heroSlider",
  "aboutSection",
  "servicesSection",
  "menuPreview",
  "menuPage",
  "counter",
  "bestSellers",
  "products",
  "blog",
  "gallery",
  "contact",
  "login",
] as const;

export type AdminMetaKey = (typeof metaKeys)[number];

export async function adminPageMetadata(key: AdminMetaKey): Promise<Metadata> {
  const locale = await getAdminLocale();
  const t = getAdminTranslator(locale);
  return {
    title: t(`meta.${key}`),
    robots: { index: false, follow: false },
  };
}

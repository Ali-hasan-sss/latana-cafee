import { routing } from "@/i18n/routing";

/** Public menu page path for a locale (`as-needed`: default locale has no prefix). */
export function hrefForMenu(locale: string): string {
  const l =
    locale === "ar" || locale === "de" || locale === "en" ? locale : routing.defaultLocale;
  if (l === routing.defaultLocale) {
    return "/menu";
  }
  return `/${l}/menu`;
}

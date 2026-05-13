export type LocalizedString = {
  en: string;
  ar: string;
  de: string;
};

export function pickLocalized(
  loc: LocalizedString,
  locale: string,
): string {
  if (locale === "ar" && loc.ar) return loc.ar;
  if (locale === "de" && loc.de) return loc.de;
  return loc.en;
}

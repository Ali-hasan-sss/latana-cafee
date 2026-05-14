export type AboutLocaleBlock = {
  sub: string;
  title: string;
  text: string;
};

export type AboutSectionDocument = {
  imageSrc: string;
  en: AboutLocaleBlock;
  ar: AboutLocaleBlock;
  de: AboutLocaleBlock;
};

export type AboutSectionPublic = AboutLocaleBlock & {
  imageSrc: string;
};

export function pickAboutLocale(doc: AboutSectionDocument, locale: string): AboutLocaleBlock {
  if (locale === "ar") return doc.ar;
  if (locale === "de") return doc.de;
  return doc.en;
}

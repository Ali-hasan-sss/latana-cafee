export type MenuPreviewLocaleBlock = {
  sub: string;
  title: string;
  text: string;
  cta: string;
  gridAria: string;
};

export type MenuPreviewSectionDocument = {
  imageSrcs: string[];
  en: MenuPreviewLocaleBlock;
  ar: MenuPreviewLocaleBlock;
  de: MenuPreviewLocaleBlock;
};

export type MenuPreviewSectionPublic = MenuPreviewLocaleBlock & {
  images: string[];
  menuPdf: string;
};

export function pickMenuPreviewLocale(doc: MenuPreviewSectionDocument, locale: string): MenuPreviewLocaleBlock {
  if (locale === "ar") return doc.ar;
  if (locale === "de") return doc.de;
  return doc.en;
}

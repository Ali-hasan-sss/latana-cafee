export type SiteContactLocaleBlock = {
  address: string;
  hours: string;
};

export type SiteContactSocial = {
  facebook: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  youtube: string;
  x: string;
};

/** Stored in MongoDB (singleton) */
export type SiteContactDocument = {
  phone: string;
  whatsapp: string;
  email: string;
  mapLat: number | null;
  mapLng: number | null;
  mapEmbedSrc: string;
  en: SiteContactLocaleBlock;
  ar: SiteContactLocaleBlock;
  de: SiteContactLocaleBlock;
  social: SiteContactSocial;
};

/** Resolved for one public locale */
export type SiteContactPublic = SiteContactDocument & {
  address: string;
  hours: string;
};

export function pickLocaleBlock(
  doc: SiteContactDocument,
  locale: string,
): SiteContactLocaleBlock {
  if (locale === "ar") return doc.ar;
  if (locale === "de") return doc.de;
  return doc.en;
}

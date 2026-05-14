import type { SiteContactDocument } from "./site-contact-types";

export type SiteContactLeanRaw = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  mapLat?: number | null;
  mapLng?: number | null;
  mapEmbedSrc?: string;
  en?: { address?: string; hours?: string };
  ar?: { address?: string; hours?: string };
  de?: { address?: string; hours?: string };
  social?: Partial<SiteContactDocument["social"]>;
};

export function leanToSiteContact(raw: SiteContactLeanRaw): SiteContactDocument {
  return {
    phone: raw.phone ?? "",
    whatsapp: raw.whatsapp ?? "",
    email: raw.email ?? "",
    mapLat: typeof raw.mapLat === "number" && !Number.isNaN(raw.mapLat) ? raw.mapLat : null,
    mapLng: typeof raw.mapLng === "number" && !Number.isNaN(raw.mapLng) ? raw.mapLng : null,
    mapEmbedSrc: raw.mapEmbedSrc ?? "",
    en: {
      address: raw.en?.address ?? "",
      hours: raw.en?.hours ?? "",
    },
    ar: {
      address: raw.ar?.address ?? "",
      hours: raw.ar?.hours ?? "",
    },
    de: {
      address: raw.de?.address ?? "",
      hours: raw.de?.hours ?? "",
    },
    social: {
      facebook: raw.social?.facebook ?? "",
      instagram: raw.social?.instagram ?? "",
      tiktok: raw.social?.tiktok ?? "",
      linkedin: raw.social?.linkedin ?? "",
      youtube: raw.social?.youtube ?? "",
      x: raw.social?.x ?? "",
    },
  };
}

/** Prefer non-empty DB values; otherwise bundled defaults (messages + assets). */
export function mergeContactDbWithFallback(
  db: SiteContactDocument,
  fallback: SiteContactDocument,
): SiteContactDocument {
  const pick = (a: string, b: string) => {
    const t = (a ?? "").trim();
    return t || (b ?? "").trim();
  };
  return {
    phone: pick(db.phone, fallback.phone),
    whatsapp: pick(db.whatsapp, fallback.whatsapp),
    email: pick(db.email, fallback.email),
    mapLat: db.mapLat ?? fallback.mapLat,
    mapLng: db.mapLng ?? fallback.mapLng,
    mapEmbedSrc: pick(db.mapEmbedSrc, fallback.mapEmbedSrc),
    en: {
      address: pick(db.en.address, fallback.en.address),
      hours: pick(db.en.hours, fallback.en.hours),
    },
    ar: {
      address: pick(db.ar.address, fallback.ar.address),
      hours: pick(db.ar.hours, fallback.ar.hours),
    },
    de: {
      address: pick(db.de.address, fallback.de.address),
      hours: pick(db.de.hours, fallback.de.hours),
    },
    social: {
      facebook: pick(db.social.facebook, fallback.social.facebook),
      instagram: pick(db.social.instagram, fallback.social.instagram),
      tiktok: pick(db.social.tiktok, fallback.social.tiktok),
      linkedin: pick(db.social.linkedin, fallback.social.linkedin),
      youtube: pick(db.social.youtube, fallback.social.youtube),
      x: pick(db.social.x, fallback.social.x),
    },
  };
}

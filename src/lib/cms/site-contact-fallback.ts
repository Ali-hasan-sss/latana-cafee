import type { SiteContactDocument } from "./site-contact-types";
import { getAssets } from "@/lib/data";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import de from "../../../messages/de.json";

const DEFAULT_HOURS_EN = `Monday to Friday from 08:00 am to 06:00 pm
Saturday and Sunday from 09:00 am to 05:00 pm`;

type FooterStrings = {
  phone?: string;
  address?: string;
  email?: string;
  facebookUrl?: string;
};

type IntroStrings = {
  hoursText?: string;
};

export function getFallbackSiteContactDocument(): SiteContactDocument {
  const assets = getAssets();
  const fe = en.footer as FooterStrings;
  const fa = ar.footer as FooterStrings;
  const fd = de.footer as FooterStrings;
  const ia = ar.intro as IntroStrings;
  const id = de.intro as IntroStrings;

  return {
    phone: fe.phone ?? "",
    whatsapp: "",
    email: fe.email ?? "",
    mapLat: assets.cafeMapLat ?? null,
    mapLng: assets.cafeMapLng ?? null,
    mapEmbedSrc: (assets.cafeGoogleMapsEmbedSrc ?? "").trim(),
    en: {
      address: fe.address ?? "",
      hours: DEFAULT_HOURS_EN,
    },
    ar: {
      address: fa.address ?? "",
      hours: ia.hoursText ?? "",
    },
    de: {
      address: fd.address ?? "",
      hours: id.hoursText ?? "",
    },
    social: {
      facebook: fe.facebookUrl ?? "",
      instagram: "",
      tiktok: "",
      linkedin: "",
      youtube: "",
      x: "",
    },
  };
}

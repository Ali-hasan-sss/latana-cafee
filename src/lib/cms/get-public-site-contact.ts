import { cache } from "react";
import type { SiteContactDocument, SiteContactPublic } from "./site-contact-types";
import { pickLocaleBlock } from "./site-contact-types";
import { getFallbackSiteContactDocument } from "./site-contact-fallback";
import { leanToSiteContact, mergeContactDbWithFallback, type SiteContactLeanRaw } from "./site-contact-merge";
import { connectDB } from "@/lib/db/connect";
import SiteContactSettings from "@/lib/models/SiteContactSettings";

function toPublic(doc: SiteContactDocument, locale: string): SiteContactPublic {
  const block = pickLocaleBlock(doc, locale);
  return {
    ...doc,
    address: block.address,
    hours: block.hours,
  };
}

export const getPublicSiteContact = cache(
  async (locale: string): Promise<SiteContactPublic> => {
    const fallback = getFallbackSiteContactDocument();
    try {
      await connectDB();
      const raw = await SiteContactSettings.findOne({ key: "default" }).lean().exec();
      if (!raw) {
        return toPublic(fallback, locale);
      }
      const db = leanToSiteContact(raw as SiteContactLeanRaw);
      const merged = mergeContactDbWithFallback(db, fallback);
      return toPublic(merged, locale);
    } catch {
      return toPublic(fallback, locale);
    }
  },
);

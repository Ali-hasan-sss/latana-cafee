import { cache } from "react";
import type { AboutSectionDocument, AboutSectionPublic } from "./about-section-types";
import { pickAboutLocale } from "./about-section-types";
import { getFallbackAboutSectionDocument } from "./about-section-fallback";
import { leanToAbout, mergeAboutDbWithFallback } from "./about-section-merge";
import { connectDB } from "@/lib/db/connect";
import AboutSectionSettings from "@/lib/models/AboutSectionSettings";

export const getPublicAboutSection = cache(
  async (locale: string): Promise<AboutSectionPublic> => {
    const fallback = getFallbackAboutSectionDocument();
    try {
      await connectDB();
      const raw = await AboutSectionSettings.findOne({ key: "default" }).lean().exec();
      if (!raw) {
        const b = pickAboutLocale(fallback, locale);
        return { ...b, imageSrc: fallback.imageSrc };
      }
      const db = leanToAbout(raw as Parameters<typeof leanToAbout>[0]);
      const merged = mergeAboutDbWithFallback(db, fallback);
      const block = pickAboutLocale(merged, locale);
      return { ...block, imageSrc: merged.imageSrc };
    } catch {
      const b = pickAboutLocale(fallback, locale);
      return { ...b, imageSrc: fallback.imageSrc };
    }
  },
);

import { cache } from "react";
import { getAssets } from "@/lib/data";
import { getFallbackMenuPreviewSectionDocument } from "./menu-preview-section-fallback";
import { leanToMenuPreview, mergeMenuPreviewDbWithFallback } from "./menu-preview-section-merge";
import { pickMenuPreviewLocale, type MenuPreviewSectionPublic } from "./menu-preview-section-types";
import { connectDB } from "@/lib/db/connect";
import MenuPreviewSectionSettings from "../models/MenuPreviewSectionSettings";

export const getPublicMenuPreviewSection = cache(
  async (locale: string): Promise<MenuPreviewSectionPublic> => {
    const fallback = getFallbackMenuPreviewSectionDocument();
    const menuPdf = getAssets().menuPdf;
    try {
      await connectDB();
      const raw = await MenuPreviewSectionSettings.findOne({ key: "default" }).lean().exec();
      if (!raw) {
        const copy = pickMenuPreviewLocale(fallback, locale);
        return { ...copy, images: fallback.imageSrcs, menuPdf };
      }
      const db = leanToMenuPreview(raw as Parameters<typeof leanToMenuPreview>[0]);
      const merged = mergeMenuPreviewDbWithFallback(db, fallback);
      const copy = pickMenuPreviewLocale(merged, locale);
      return { ...copy, images: merged.imageSrcs, menuPdf };
    } catch {
      const copy = pickMenuPreviewLocale(fallback, locale);
      return { ...copy, images: fallback.imageSrcs, menuPdf };
    }
  },
);

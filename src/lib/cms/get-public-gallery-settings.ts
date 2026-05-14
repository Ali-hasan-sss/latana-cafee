import { cache } from "react";
import { getFallbackGallerySettings } from "./gallery-settings-fallback";
import { leanToGallery, mergeGalleryDbWithFallback } from "./gallery-settings-merge";
import type { GallerySettingsDocument } from "./gallery-settings-types";
import { connectDB } from "@/lib/db/connect";
import GallerySettings from "@/lib/models/GallerySettings";

export const getPublicGallerySettings = cache(async (): Promise<GallerySettingsDocument> => {
  const fallback = getFallbackGallerySettings();
  try {
    await connectDB();
    const raw = await GallerySettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return fallback;
    }
    const db = leanToGallery(raw as Parameters<typeof leanToGallery>[0]);
    return mergeGalleryDbWithFallback(db, fallback);
  } catch {
    return fallback;
  }
});

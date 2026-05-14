import { cache } from "react";
import { getFallbackBestSellersSectionDocument } from "./best-sellers-section-fallback";
import { leanToBestSellers, mergeBestSellersDbWithFallback } from "./best-sellers-section-merge";
import { pickBestSellersPublic, type BestSellersSectionPublic } from "./best-sellers-section-types";
import { connectDB } from "@/lib/db/connect";
import BestSellersSectionSettings from "@/lib/models/BestSellersSectionSettings";

export const getPublicBestSellersSection = cache(
  async (locale: string): Promise<BestSellersSectionPublic> => {
    const fallback = getFallbackBestSellersSectionDocument();
    try {
      await connectDB();
      const raw = await BestSellersSectionSettings.findOne({ key: "default" }).lean().exec();
      if (!raw) {
        return pickBestSellersPublic(fallback, locale);
      }
      const db = leanToBestSellers(raw as Parameters<typeof leanToBestSellers>[0]);
      const merged = mergeBestSellersDbWithFallback(db, fallback);
      return pickBestSellersPublic(merged, locale);
    } catch {
      return pickBestSellersPublic(fallback, locale);
    }
  },
);

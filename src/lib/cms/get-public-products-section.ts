import { cache } from "react";
import { getFallbackProductsSectionDocument } from "./products-section-fallback";
import { leanToProducts, mergeProductsDbWithFallback } from "./products-section-merge";
import { pickProductsPublic, type ProductsSectionPublic } from "./products-section-types";
import { connectDB } from "@/lib/db/connect";
import ProductsSectionSettings from "@/lib/models/ProductsSectionSettings";

export const getPublicProductsSection = cache(
  async (locale: string): Promise<ProductsSectionPublic> => {
    const fallback = getFallbackProductsSectionDocument();
    try {
      await connectDB();
      const raw = await ProductsSectionSettings.findOne({ key: "default" }).lean().exec();
      if (!raw) {
        return pickProductsPublic(fallback, locale);
      }
      const db = leanToProducts(raw as Parameters<typeof leanToProducts>[0]);
      const merged = mergeProductsDbWithFallback(db, fallback);
      return pickProductsPublic(merged, locale);
    } catch {
      return pickProductsPublic(fallback, locale);
    }
  },
);

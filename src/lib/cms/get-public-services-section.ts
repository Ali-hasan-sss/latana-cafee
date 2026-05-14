import { cache } from "react";
import { getFallbackServicesSectionDocument } from "./services-section-fallback";
import { leanToServices, mergeServicesDbWithFallback } from "./services-section-merge";
import { pickServicesPublic, type ServicesSectionPublic } from "./services-section-types";
import { connectDB } from "@/lib/db/connect";
import ServicesSectionSettings from "@/lib/models/ServicesSectionSettings";

export const getPublicServicesSection = cache(
  async (locale: string): Promise<ServicesSectionPublic> => {
    const fallback = getFallbackServicesSectionDocument();
    try {
      await connectDB();
      const raw = await ServicesSectionSettings.findOne({ key: "default" }).lean().exec();
      if (!raw) {
        return pickServicesPublic(fallback, locale);
      }
      const db = leanToServices(raw as Parameters<typeof leanToServices>[0]);
      const merged = mergeServicesDbWithFallback(db, fallback);
      return pickServicesPublic(merged, locale);
    } catch {
      return pickServicesPublic(fallback, locale);
    }
  },
);

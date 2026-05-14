import { cache } from "react";
import { getFallbackCounterSectionDocument } from "./counter-section-fallback";
import { leanToCounter, mergeCounterDbWithFallback } from "./counter-section-merge";
import { pickCounterPublic, type CounterSectionPublic } from "./counter-section-types";
import { connectDB } from "@/lib/db/connect";
import CounterSectionSettings from "@/lib/models/CounterSectionSettings";

export const getPublicCounterSection = cache(
  async (locale: string): Promise<CounterSectionPublic> => {
    const fallback = getFallbackCounterSectionDocument();
    try {
      await connectDB();
      const raw = await CounterSectionSettings.findOne({ key: "default" }).lean().exec();
      if (!raw) {
        return pickCounterPublic(fallback, locale);
      }
      const db = leanToCounter(raw as Parameters<typeof leanToCounter>[0]);
      const merged = mergeCounterDbWithFallback(db, fallback);
      return pickCounterPublic(merged, locale);
    } catch {
      return pickCounterPublic(fallback, locale);
    }
  },
);

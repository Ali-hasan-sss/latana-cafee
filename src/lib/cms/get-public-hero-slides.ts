import type { HeroSlidePublic } from "./hero-slider-types";
import { getFallbackHeroSlidesAdmin } from "./hero-slider-fallback";
import { connectDB } from "@/lib/db/connect";
import HeroSliderSettings from "@/lib/models/HeroSliderSettings";

export async function getPublicHeroSlides(
  locale: string,
): Promise<HeroSlidePublic[]> {
  const lang =
    locale === "ar" || locale === "de" ? (locale as "ar" | "de") : "en";

  try {
    await connectDB();
    const doc = await HeroSliderSettings.findOne({ key: "default" })
      .lean()
      .exec();
    if (doc?.slides?.length) {
      const sorted = [...doc.slides].sort((a, b) => a.order - b.order);
      return sorted.map((s) => {
        const block = s[lang] ?? { title: "", text: "" };
        return {
          src: s.imageSrc,
          title: block.title ?? "",
          text: block.text ?? "",
        };
      });
    }
  } catch {
    /* Mongo unavailable — use static fallback */
  }

  return getFallbackHeroSlidesAdmin().map((s) => {
    const block = s[lang];
    return {
      src: s.imageSrc,
      title: block.title,
      text: block.text,
    };
  });
}

import type { HeroSlideAdmin } from "./hero-slider-types";
import { getAssets } from "@/lib/data";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import de from "../../../messages/de.json";

const byLang = { en, ar, de } as const;

function slideBlock(lang: keyof typeof byLang, index: number) {
  const slides = byLang[lang].hero.slides as { title: string; text: string }[];
  return slides[index] ?? { title: "", text: "" };
}

export function getFallbackHeroSlidesAdmin(): HeroSlideAdmin[] {
  const assets = getAssets();
  return assets.heroSlides.map((src, i) => ({
    imageSrc: src,
    order: i,
    en: slideBlock("en", i),
    ar: slideBlock("ar", i),
    de: slideBlock("de", i),
  }));
}

import type { AboutSectionDocument } from "./about-section-types";
import { getAssets } from "@/lib/data";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import de from "../../../messages/de.json";

type AboutMsg = { sub?: string; title?: string; text?: string };

function block(lang: AboutMsg): { sub: string; title: string; text: string } {
  return {
    sub: lang.sub ?? "",
    title: lang.title ?? "",
    text: lang.text ?? "",
  };
}

export function getFallbackAboutSectionDocument(): AboutSectionDocument {
  const assets = getAssets();
  return {
    imageSrc: assets.aboutImage,
    en: block(en.about as AboutMsg),
    ar: block(ar.about as AboutMsg),
    de: block(de.about as AboutMsg),
  };
}

import type { AboutSectionDocument } from "./about-section-types";

export function leanToAbout(raw: {
  imageSrc?: string;
  en?: { sub?: string; title?: string; text?: string };
  ar?: { sub?: string; title?: string; text?: string };
  de?: { sub?: string; title?: string; text?: string };
}): AboutSectionDocument {
  const b = (x?: { sub?: string; title?: string; text?: string }) => ({
    sub: x?.sub ?? "",
    title: x?.title ?? "",
    text: x?.text ?? "",
  });
  return {
    imageSrc: raw.imageSrc ?? "",
    en: b(raw.en),
    ar: b(raw.ar),
    de: b(raw.de),
  };
}

export function mergeAboutDbWithFallback(
  db: AboutSectionDocument,
  fallback: AboutSectionDocument,
): AboutSectionDocument {
  const pick = (a: string, b: string) => {
    const t = (a ?? "").trim();
    return t || (b ?? "").trim();
  };
  const mergeBlock = (
    d: AboutSectionDocument["en"],
    f: AboutSectionDocument["en"],
  ): AboutSectionDocument["en"] => ({
    sub: pick(d.sub, f.sub),
    title: pick(d.title, f.title),
    text: pick(d.text, f.text),
  });
  return {
    imageSrc: pick(db.imageSrc, fallback.imageSrc),
    en: mergeBlock(db.en, fallback.en),
    ar: mergeBlock(db.ar, fallback.ar),
    de: mergeBlock(db.de, fallback.de),
  };
}

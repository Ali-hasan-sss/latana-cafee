import type {
  MenuPreviewLocaleBlock,
  MenuPreviewSectionDocument,
} from "./menu-preview-section-types";

function pickStr(a: string, b: string) {
  const t = (a ?? "").trim();
  return t || (b ?? "").trim();
}

function mergeLocaleBlock(db: MenuPreviewLocaleBlock, fb: MenuPreviewLocaleBlock): MenuPreviewLocaleBlock {
  return {
    sub: pickStr(db.sub, fb.sub),
    title: pickStr(db.title, fb.title),
    text: pickStr(db.text, fb.text),
    cta: pickStr(db.cta, fb.cta),
    gridAria: pickStr(db.gridAria, fb.gridAria),
  };
}

function padFour(slots: string[] | undefined): string[] {
  const a = [...(slots ?? [])].map((s) => String(s ?? "").trim()).slice(0, 4);
  while (a.length < 4) {
    a.push("");
  }
  return a.slice(0, 4);
}

function mergeImageSlots(db: string[], fb: string[]): string[] {
  const d = padFour(db);
  const f = padFour(fb);
  return [0, 1, 2, 3].map((i) => pickStr(d[i]!, f[i]!));
}

export function leanToMenuPreview(raw: {
  imageSrcs?: string[];
  en?: Partial<MenuPreviewLocaleBlock>;
  ar?: Partial<MenuPreviewLocaleBlock>;
  de?: Partial<MenuPreviewLocaleBlock>;
}): MenuPreviewSectionDocument {
  const loc = (x?: Partial<MenuPreviewLocaleBlock>): MenuPreviewLocaleBlock => ({
    sub: x?.sub ?? "",
    title: x?.title ?? "",
    text: x?.text ?? "",
    cta: x?.cta ?? "",
    gridAria: x?.gridAria ?? "",
  });
  return {
    imageSrcs: padFour(raw.imageSrcs),
    en: loc(raw.en),
    ar: loc(raw.ar),
    de: loc(raw.de),
  };
}

export function mergeMenuPreviewDbWithFallback(
  db: MenuPreviewSectionDocument,
  fallback: MenuPreviewSectionDocument,
): MenuPreviewSectionDocument {
  return {
    imageSrcs: mergeImageSlots(db.imageSrcs, fallback.imageSrcs),
    en: mergeLocaleBlock(db.en, fallback.en),
    ar: mergeLocaleBlock(db.ar, fallback.ar),
    de: mergeLocaleBlock(db.de, fallback.de),
  };
}

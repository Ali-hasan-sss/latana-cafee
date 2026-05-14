import type { GallerySettingsDocument } from "./gallery-settings-types";

function padFour(urls: string[]): string[] {
  const a = [...urls].map((s) => String(s ?? "").trim()).slice(0, 4);
  while (a.length < 4) {
    a.push("");
  }
  return a.slice(0, 4);
}

export function leanToGallery(raw: { pool?: string[]; homeTeaser?: string[] }): GallerySettingsDocument {
  return {
    pool: [...(raw.pool ?? [])].map((s) => String(s ?? "").trim()).filter(Boolean),
    homeTeaser: padFour(raw.homeTeaser ?? []),
  };
}

export function mergeGalleryDbWithFallback(
  db: GallerySettingsDocument,
  fallback: GallerySettingsDocument,
): GallerySettingsDocument {
  const dedupe = (arr: string[]) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const x of arr.map((s) => s.trim()).filter(Boolean)) {
      if (seen.has(x)) continue;
      seen.add(x);
      out.push(x);
    }
    return out;
  };

  let pool = dedupe([...db.pool]);
  if (!pool.length) {
    pool = [...fallback.pool];
  }

  const resolveHomeSlot = (i: number, rawSlot: string): string => {
    const t = rawSlot.trim();
    if (t && pool.includes(t)) {
      return t;
    }
    const fbh = (fallback.homeTeaser[i] ?? "").trim();
    if (fbh && pool.includes(fbh)) {
      return fbh;
    }
    return pool[i % Math.max(pool.length, 1)] ?? pool[0] ?? "";
  };

  const homeTeaser = [0, 1, 2, 3].map((i) => resolveHomeSlot(i, db.homeTeaser[i] ?? ""));
  return { pool, homeTeaser };
}

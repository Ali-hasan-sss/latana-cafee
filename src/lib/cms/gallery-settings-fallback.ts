import type { GallerySettingsDocument } from "./gallery-settings-types";
import { getAssets } from "@/lib/data";

function padFour(urls: string[]): string[] {
  const a = [...urls].map((s) => String(s ?? "").trim()).slice(0, 4);
  while (a.length < 4) {
    a.push("");
  }
  return a.slice(0, 4);
}

export function getFallbackGallerySettings(): GallerySettingsDocument {
  const pool = [...getAssets().gallery]
    .map((s) => String(s ?? "").trim())
    .filter(Boolean);
  const home = padFour(pool);
  return { pool: pool.length ? pool : [], homeTeaser: home };
}

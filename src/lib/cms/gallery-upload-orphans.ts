import type { GallerySettingsDocument } from "@/lib/cms/gallery-settings-types";

/** `/uploads/…` URLs present in `draft` but not in persisted `initial` (never saved). */
export function collectOrphanUploadUrls(
  draft: GallerySettingsDocument,
  initial: GallerySettingsDocument,
): string[] {
  const initialSet = new Set(
    [...initial.pool, ...initial.homeTeaser].map((s) => String(s ?? "").trim()).filter(Boolean),
  );
  const draftUrls = [...draft.pool, ...draft.homeTeaser]
    .map((s) => String(s ?? "").trim())
    .filter(Boolean);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const u of draftUrls) {
    if (!u.startsWith("/uploads/")) continue;
    if (initialSet.has(u)) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

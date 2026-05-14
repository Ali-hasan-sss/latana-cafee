"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { deletePublicUploadIfSafe } from "@/lib/cms/delete-public-upload";
import { getFallbackGallerySettings } from "@/lib/cms/gallery-settings-fallback";
import { leanToGallery, mergeGalleryDbWithFallback } from "@/lib/cms/gallery-settings-merge";
import type { GallerySettingsDocument } from "@/lib/cms/gallery-settings-types";
import { connectDB } from "@/lib/db/connect";
import GallerySettings from "@/lib/models/GallerySettings";
import { routing } from "@/i18n/routing";

function revalidateAllPublic() {
  revalidatePath("/");
  revalidatePath("/gallery");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`);
    revalidatePath(`/${loc}/gallery`);
  }
}

function padFour(urls: string[]): string[] {
  const a = [...urls].map((s) => String(s ?? "").trim()).slice(0, 4);
  while (a.length < 4) {
    a.push("");
  }
  return a.slice(0, 4);
}

async function fetchMergedGallery(): Promise<GallerySettingsDocument> {
  const fallback = getFallbackGallerySettings();
  try {
    await connectDB();
    const raw = await GallerySettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return fallback;
    }
    const db = leanToGallery(raw as Parameters<typeof leanToGallery>[0]);
    return mergeGalleryDbWithFallback(db, fallback);
  } catch {
    return fallback;
  }
}

function dedupePoolPreserve(pool: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of pool) {
    const t = u.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function normalizeGalleryPayload(
  data: GallerySettingsDocument,
  fallback: GallerySettingsDocument,
): GallerySettingsDocument {
  let pool = dedupePoolPreserve([...(data.pool ?? [])].map((s) => String(s ?? "")));
  const rawHome = padFour(data.homeTeaser ?? []);
  for (const u of rawHome) {
    if (u && !pool.includes(u)) {
      pool.push(u);
    }
  }
  pool = dedupePoolPreserve(pool);
  if (!pool.length) {
    pool = [...fallback.pool];
  }
  const homeTeaser = [0, 1, 2, 3].map((i) => {
    const want = (rawHome[i] ?? "").trim();
    if (want && pool.includes(want)) {
      return want;
    }
    const fbh = (fallback.homeTeaser[i] ?? "").trim();
    if (fbh && pool.includes(fbh)) {
      return fbh;
    }
    return pool[i % pool.length] ?? pool[0] ?? "";
  });
  return { pool, homeTeaser };
}

export async function getGallerySettingsForAdmin(): Promise<GallerySettingsDocument> {
  const session = await getAdminSession();
  const fallback = getFallbackGallerySettings();
  if (!session) {
    return fallback;
  }
  return fetchMergedGallery();
}

export async function saveGallerySettings(
  data: GallerySettingsDocument,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  const fallback = getFallbackGallerySettings();
  const payload = normalizeGalleryPayload(data, fallback);

  if (!payload.pool.length) {
    return { ok: false, error: "Gallery pool cannot be empty." };
  }
  for (let i = 0; i < 4; i++) {
    if (!payload.homeTeaser[i] || !payload.pool.includes(payload.homeTeaser[i]!)) {
      return { ok: false, error: "Each home teaser slot must use an image from the pool." };
    }
  }

  try {
    await connectDB();
    const prev = await GallerySettings.findOne({ key: "default" }).lean().exec();
    const prevDoc = prev
      ? leanToGallery(prev as Parameters<typeof leanToGallery>[0])
      : { pool: [] as string[], homeTeaser: ["", "", "", ""] };

    const prevUrls = new Set([...prevDoc.pool, ...prevDoc.homeTeaser].map((s) => s.trim()).filter(Boolean));
    const nextUrls = new Set([...payload.pool, ...payload.homeTeaser].map((s) => s.trim()).filter(Boolean));

    for (const url of prevUrls) {
      if (!nextUrls.has(url) && url.startsWith("/uploads/")) {
        await deletePublicUploadIfSafe(url);
      }
    }

    await GallerySettings.findOneAndUpdate(
      { key: "default" },
      { $set: { pool: payload.pool, homeTeaser: payload.homeTeaser } },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save gallery settings." };
  }
}

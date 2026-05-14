"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { deletePublicUploadIfSafe } from "@/lib/cms/delete-public-upload";
import { getFallbackCounterSectionDocument } from "@/lib/cms/counter-section-fallback";
import { leanToCounter, mergeCounterDbWithFallback } from "@/lib/cms/counter-section-merge";
import type { CounterSectionDocument } from "@/lib/cms/counter-section-types";
import { connectDB } from "@/lib/db/connect";
import CounterSectionSettings from "@/lib/models/CounterSectionSettings";
import { routing } from "@/i18n/routing";

function revalidateAllPublic() {
  revalidatePath("/");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`);
  }
}

function trimSection(s: CounterSectionDocument["en"]) {
  return {
    sub: (s.sub ?? "").trim(),
    title: (s.title ?? "").trim(),
    lead: (s.lead ?? "").trim(),
  };
}

export async function getCounterSectionForAdmin(): Promise<CounterSectionDocument> {
  const session = await getAdminSession();
  const fallback = getFallbackCounterSectionDocument();
  if (!session) {
    return fallback;
  }
  try {
    await connectDB();
    const raw = await CounterSectionSettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return fallback;
    }
    const db = leanToCounter(raw as Parameters<typeof leanToCounter>[0]);
    return mergeCounterDbWithFallback(db, fallback);
  } catch {
    return fallback;
  }
}

export async function saveCounterSectionSettings(
  data: CounterSectionDocument,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  const fallback = getFallbackCounterSectionDocument();
  if (fallback.items.length === 0) {
    return { ok: false, error: "Counter template is empty." };
  }

  const incoming = data.items ?? [];
  if (incoming.length !== fallback.items.length) {
    return { ok: false, error: "Counter rows must match the site template." };
  }
  for (let i = 0; i < fallback.items.length; i++) {
    if (incoming[i]?.id !== fallback.items[i].id) {
      return { ok: false, error: "Counter row ids must match the site template." };
    }
  }

  const payload: CounterSectionDocument = {
    bgImageSrc: (data.bgImageSrc ?? "").trim(),
    en: trimSection(data.en ?? { sub: "", title: "", lead: "" }),
    ar: trimSection(data.ar ?? { sub: "", title: "", lead: "" }),
    de: trimSection(data.de ?? { sub: "", title: "", lead: "" }),
    items: fallback.items.map((fb, i) => {
      const row = incoming[i]!;
      const value = typeof row.value === "number" ? row.value : Number(row.value);
      return {
        id: fb.id,
        value: Number.isFinite(value) ? value : fb.value,
        suffix: (row.suffix ?? "").trim(),
        en: { label: (row.en?.label ?? "").trim() },
        ar: { label: (row.ar?.label ?? "").trim() },
        de: { label: (row.de?.label ?? "").trim() },
      };
    }),
  };

  if (!payload.bgImageSrc) {
    return { ok: false, error: "Background image is required." };
  }

  try {
    await connectDB();
    const prev = await CounterSectionSettings.findOne({ key: "default" }).lean().exec();
    const prevBg =
      prev && typeof prev === "object" && "bgImageSrc" in prev
        ? String((prev as { bgImageSrc?: string }).bgImageSrc ?? "").trim()
        : "";

    if (prevBg && prevBg !== payload.bgImageSrc && prevBg.startsWith("/uploads/")) {
      await deletePublicUploadIfSafe(prevBg);
    }

    await CounterSectionSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save counter section." };
  }
}

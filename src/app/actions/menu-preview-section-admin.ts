"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { deletePublicUploadIfSafe } from "@/lib/cms/delete-public-upload";
import { getFallbackMenuPreviewSectionDocument } from "@/lib/cms/menu-preview-section-fallback";
import { leanToMenuPreview, mergeMenuPreviewDbWithFallback } from "@/lib/cms/menu-preview-section-merge";
import type { MenuPreviewLocaleBlock, MenuPreviewSectionDocument } from "@/lib/cms/menu-preview-section-types";
import { connectDB } from "@/lib/db/connect";
import MenuPreviewSectionSettings from "@/lib/models/MenuPreviewSectionSettings";
import { routing } from "@/i18n/routing";

function revalidateAllPublic() {
  revalidatePath("/");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`);
  }
}

function padFour(slots: string[] | undefined): string[] {
  const a = [...(slots ?? [])].map((s) => String(s ?? "").trim()).slice(0, 4);
  while (a.length < 4) {
    a.push("");
  }
  return a.slice(0, 4);
}

function trimLocale(b: MenuPreviewLocaleBlock): MenuPreviewLocaleBlock {
  return {
    sub: (b.sub ?? "").trim(),
    title: (b.title ?? "").trim(),
    text: (b.text ?? "").trim(),
    cta: (b.cta ?? "").trim(),
    gridAria: (b.gridAria ?? "").trim(),
  };
}

export async function getMenuPreviewSectionForAdmin(): Promise<MenuPreviewSectionDocument> {
  const session = await getAdminSession();
  const fallback = getFallbackMenuPreviewSectionDocument();
  if (!session) {
    return fallback;
  }
  try {
    await connectDB();
    const raw = await MenuPreviewSectionSettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return fallback;
    }
    const db = leanToMenuPreview(raw as Parameters<typeof leanToMenuPreview>[0]);
    return mergeMenuPreviewDbWithFallback(db, fallback);
  } catch {
    return fallback;
  }
}

export async function saveMenuPreviewSectionSettings(
  data: MenuPreviewSectionDocument,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  const imageSrcs = padFour(data.imageSrcs);
  for (let i = 0; i < 4; i++) {
    if (!imageSrcs[i]) {
      return { ok: false, error: "All four preview images are required." };
    }
  }

  const payload: MenuPreviewSectionDocument = {
    imageSrcs,
    en: trimLocale(data.en ?? { sub: "", title: "", text: "", cta: "", gridAria: "" }),
    ar: trimLocale(data.ar ?? { sub: "", title: "", text: "", cta: "", gridAria: "" }),
    de: trimLocale(data.de ?? { sub: "", title: "", text: "", cta: "", gridAria: "" }),
  };

  try {
    await connectDB();
    const prev = await MenuPreviewSectionSettings.findOne({ key: "default" }).lean().exec();
    const prevSlots = prev
      ? padFour(
          leanToMenuPreview(prev as Parameters<typeof leanToMenuPreview>[0]).imageSrcs,
        )
      : ["", "", "", ""];

    for (let i = 0; i < 4; i++) {
      const oldUrl = (prevSlots[i] ?? "").trim();
      const newUrl = payload.imageSrcs[i]!.trim();
      if (oldUrl && oldUrl !== newUrl && oldUrl.startsWith("/uploads/")) {
        await deletePublicUploadIfSafe(oldUrl);
      }
    }

    await MenuPreviewSectionSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save menu preview section." };
  }
}

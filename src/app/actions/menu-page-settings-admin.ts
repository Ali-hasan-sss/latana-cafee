"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { deletePublicUploadIfSafe } from "@/lib/cms/delete-public-upload";
import { getFallbackMenuPageCms } from "@/lib/cms/menu-page-settings-fallback";
import {
  leanToMenuPageCms,
  mergeMenuPageCmsForAdmin,
} from "@/lib/cms/menu-page-settings-merge";
import type { MenuPageCmsDocument } from "@/lib/cms/menu-page-cms-types";
import { connectDB } from "@/lib/db/connect";
import MenuPageSettings from "@/lib/models/MenuPageSettings";
import { routing } from "@/i18n/routing";

function revalidateMenuPublic() {
  revalidatePath("/menu");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}/menu`);
  }
}

function collectUploadUrls(doc: MenuPageCmsDocument): Set<string> {
  const s = new Set<string>();
  const bg = doc.heroBackground?.trim();
  if (bg?.startsWith("/uploads/")) s.add(bg);
  for (const col of doc.pricingColumns ?? []) {
    for (const it of col.items ?? []) {
      const img = it.image?.trim();
      if (img?.startsWith("/uploads/")) s.add(img);
    }
  }
  return s;
}

async function fetchMergedForAdmin(): Promise<MenuPageCmsDocument> {
  const fallback = getFallbackMenuPageCms();
  try {
    await connectDB();
    const raw = await MenuPageSettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return fallback;
    }
    const db = leanToMenuPageCms(raw as Parameters<typeof leanToMenuPageCms>[0]);
    return mergeMenuPageCmsForAdmin(db, fallback);
  } catch {
    return fallback;
  }
}

export async function getMenuPageSettingsForAdmin(): Promise<MenuPageCmsDocument> {
  const session = await getAdminSession();
  const fallback = getFallbackMenuPageCms();
  if (!session) {
    return fallback;
  }
  return fetchMergedForAdmin();
}

function validatePayload(data: MenuPageCmsDocument): string | null {
  if (!data.heroBackground?.trim()) {
    return "heroBg";
  }
  if (!data.pricingColumns?.length) {
    return "categories";
  }
  for (const col of data.pricingColumns) {
    if (!(col.id ?? "").trim()) {
      return "categoryId";
    }
    if (!(col.title?.en ?? "").trim() && !(col.title?.ar ?? "").trim() && !(col.title?.de ?? "").trim()) {
      return "categoryTitle";
    }
    for (const it of col.items ?? []) {
      if (!(it.image ?? "").trim()) {
        return "itemImage";
      }
    }
  }
  return null;
}

export async function saveMenuPageSettings(
  data: MenuPageCmsDocument,
): Promise<{ ok: boolean; error?: string; errorKey?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized.", errorKey: "unauthorized" };
  }

  const err = validatePayload(data);
  if (err) {
    return { ok: false, errorKey: err };
  }

  const payload: MenuPageCmsDocument = {
    heroBackground: data.heroBackground.trim(),
    hero: {
      title: {
        en: (data.hero.title.en ?? "").trim(),
        ar: (data.hero.title.ar ?? "").trim(),
        de: (data.hero.title.de ?? "").trim(),
      },
      breadcrumbHome: {
        en: (data.hero.breadcrumbHome.en ?? "").trim(),
        ar: (data.hero.breadcrumbHome.ar ?? "").trim(),
        de: (data.hero.breadcrumbHome.de ?? "").trim(),
      },
      breadcrumbCurrent: {
        en: (data.hero.breadcrumbCurrent.en ?? "").trim(),
        ar: (data.hero.breadcrumbCurrent.ar ?? "").trim(),
        de: (data.hero.breadcrumbCurrent.de ?? "").trim(),
      },
    },
    pricingColumns: data.pricingColumns.map((col) => ({
      id: col.id.trim(),
      title: {
        en: (col.title.en ?? "").trim(),
        ar: (col.title.ar ?? "").trim(),
        de: (col.title.de ?? "").trim(),
      },
      items: col.items.map((it) => ({
        image: (it.image ?? "").trim(),
        price: (it.price ?? "").trim(),
        name: {
          en: (it.name.en ?? "").trim(),
          ar: (it.name.ar ?? "").trim(),
          de: (it.name.de ?? "").trim(),
        },
        desc: {
          en: (it.desc.en ?? "").trim(),
          ar: (it.desc.ar ?? "").trim(),
          de: (it.desc.de ?? "").trim(),
        },
      })),
    })),
  };

  try {
    await connectDB();
    const prev = await MenuPageSettings.findOne({ key: "default" }).lean().exec();
    const prevDoc = prev ? leanToMenuPageCms(prev as Parameters<typeof leanToMenuPageCms>[0]) : null;
    const prevMerged = prevDoc ? mergeMenuPageCmsForAdmin(prevDoc, getFallbackMenuPageCms()) : null;
    const prevUrls = prevMerged ? collectUploadUrls(prevMerged) : new Set<string>();
    const nextUrls = collectUploadUrls(payload);

    for (const url of prevUrls) {
      if (!nextUrls.has(url)) {
        await deletePublicUploadIfSafe(url);
      }
    }

    await MenuPageSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateMenuPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save menu page." };
  }
}

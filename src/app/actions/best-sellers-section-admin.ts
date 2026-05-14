"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { deletePublicUploadIfSafe } from "@/lib/cms/delete-public-upload";
import { getFallbackBestSellersSectionDocument } from "@/lib/cms/best-sellers-section-fallback";
import { leanToBestSellers, mergeBestSellersDbWithFallback } from "@/lib/cms/best-sellers-section-merge";
import type {
  BestSellerItemDocument,
  BestSellersHeadingsOnly,
  BestSellersSectionDocument,
} from "@/lib/cms/best-sellers-section-types";
import { connectDB } from "@/lib/db/connect";
import BestSellersSectionSettings from "@/lib/models/BestSellersSectionSettings";
import { routing } from "@/i18n/routing";

function revalidateAllPublic() {
  revalidatePath("/");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`);
  }
}

function trimSection(s: BestSellersSectionDocument["en"]) {
  return {
    sub: (s.sub ?? "").trim(),
    title: (s.title ?? "").trim(),
    lead: (s.lead ?? "").trim(),
  };
}

function trimCopy(c: { name: string; desc: string }) {
  return {
    name: (c.name ?? "").trim(),
    desc: (c.desc ?? "").trim(),
  };
}

async function fetchMergedBestSellersDocument(): Promise<BestSellersSectionDocument> {
  const fallback = getFallbackBestSellersSectionDocument();
  try {
    await connectDB();
    const raw = await BestSellersSectionSettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return fallback;
    }
    return mergeBestSellersDbWithFallback(
      leanToBestSellers(raw as Parameters<typeof leanToBestSellers>[0]),
      fallback,
    );
  } catch {
    return fallback;
  }
}

function normalizeItemInput(incoming: BestSellerItemDocument, fb: BestSellerItemDocument): BestSellerItemDocument {
  let imageSrc = (incoming.imageSrc ?? "").trim();
  if (!imageSrc) {
    imageSrc = fb.imageSrc;
  }
  return {
    id: fb.id,
    imageSrc,
    price: (incoming.price ?? "").trim() || fb.price,
    en: trimCopy(incoming.en ?? { name: "", desc: "" }),
    ar: trimCopy(incoming.ar ?? { name: "", desc: "" }),
    de: trimCopy(incoming.de ?? { name: "", desc: "" }),
  };
}

export async function getBestSellersSectionForAdmin(): Promise<BestSellersSectionDocument> {
  const session = await getAdminSession();
  const fallback = getFallbackBestSellersSectionDocument();
  if (!session) {
    return fallback;
  }
  return fetchMergedBestSellersDocument();
}

export async function saveBestSellersSectionHeadings(
  headings: BestSellersHeadingsOnly,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  try {
    const base = await fetchMergedBestSellersDocument();
    const payload: BestSellersSectionDocument = {
      ...base,
      en: trimSection(headings.en ?? { sub: "", title: "", lead: "" }),
      ar: trimSection(headings.ar ?? { sub: "", title: "", lead: "" }),
      de: trimSection(headings.de ?? { sub: "", title: "", lead: "" }),
    };

    await connectDB();
    await BestSellersSectionSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save section headings." };
  }
}

export async function saveBestSellersSectionItem(
  item: BestSellerItemDocument,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  const fallback = getFallbackBestSellersSectionDocument();
  const fbRow = fallback.items.find((r) => r.id === item.id);
  if (!fbRow) {
    return { ok: false, error: "Unknown product id." };
  }

  const newRow = normalizeItemInput(item, fbRow);
  if (!newRow.imageSrc) {
    return { ok: false, error: "Product image is required." };
  }

  try {
    const base = await fetchMergedBestSellersDocument();
    const oldRow = base.items.find((r) => r.id === newRow.id);
    const oldUrl = (oldRow?.imageSrc ?? "").trim();
    const newUrl = newRow.imageSrc.trim();
    if (oldUrl && oldUrl !== newUrl && oldUrl.startsWith("/uploads/")) {
      await deletePublicUploadIfSafe(oldUrl);
    }

    const items = base.items.map((r) => (r.id === newRow.id ? newRow : r));
    const payload: BestSellersSectionDocument = { ...base, items };

    await connectDB();
    await BestSellersSectionSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save product." };
  }
}

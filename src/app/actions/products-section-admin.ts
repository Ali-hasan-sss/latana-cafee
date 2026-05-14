"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { deletePublicUploadIfSafe } from "@/lib/cms/delete-public-upload";
import { getFallbackProductsSectionDocument } from "@/lib/cms/products-section-fallback";
import {
  leanToProducts,
  mergeProductTab,
  mergeProductsDbWithFallback,
  syntheticProductTab,
} from "@/lib/cms/products-section-merge";
import type {
  ProductTabDocument,
  ProductTabItemDocument,
  ProductsHeadingsOnly,
  ProductsSectionDocument,
} from "@/lib/cms/products-section-types";
import { connectDB } from "@/lib/db/connect";
import ProductsSectionSettings from "@/lib/models/ProductsSectionSettings";
import { routing } from "@/i18n/routing";

function revalidateAllPublic() {
  revalidatePath("/");
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`);
  }
}

function trimSection(s: ProductsSectionDocument["en"]) {
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

async function fetchMergedProductsDocument(): Promise<ProductsSectionDocument> {
  const fallback = getFallbackProductsSectionDocument();
  try {
    await connectDB();
    const raw = await ProductsSectionSettings.findOne({ key: "default" }).lean().exec();
    if (!raw) {
      return fallback;
    }
    return mergeProductsDbWithFallback(
      leanToProducts(raw as Parameters<typeof leanToProducts>[0]),
      fallback,
    );
  } catch {
    return fallback;
  }
}

function collectUploadUrlsFromTab(tab: ProductTabDocument): string[] {
  const urls: string[] = [];
  for (const it of tab.items) {
    const u = (it.imageSrc ?? "").trim();
    if (u.startsWith("/uploads/")) urls.push(u);
  }
  return urls;
}

function slugifyTabId(primary: string, existing: Set<string>): string {
  let base = primary
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!base) base = "tab";
  let id = base;
  let n = 0;
  while (existing.has(id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

function normalizeProductItem(
  incoming: ProductTabItemDocument,
  fbItem: ProductTabItemDocument,
): ProductTabItemDocument {
  let imageSrc = (incoming.imageSrc ?? "").trim();
  if (!imageSrc) {
    imageSrc = fbItem.imageSrc;
  }
  return {
    itemKey: fbItem.itemKey,
    imageSrc,
    price: (incoming.price ?? "").trim() || fbItem.price,
    en: trimCopy(incoming.en ?? { name: "", desc: "" }),
    ar: trimCopy(incoming.ar ?? { name: "", desc: "" }),
    de: trimCopy(incoming.de ?? { name: "", desc: "" }),
  };
}

export async function getProductsSectionForAdmin(): Promise<ProductsSectionDocument> {
  const session = await getAdminSession();
  const fallback = getFallbackProductsSectionDocument();
  if (!session) {
    return fallback;
  }
  return fetchMergedProductsDocument();
}

export async function saveProductsSectionHeadings(
  headings: ProductsHeadingsOnly,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  try {
    const base = await fetchMergedProductsDocument();
    const payload: ProductsSectionDocument = {
      ...base,
      en: trimSection(headings.en ?? { sub: "", title: "", lead: "" }),
      ar: trimSection(headings.ar ?? { sub: "", title: "", lead: "" }),
      de: trimSection(headings.de ?? { sub: "", title: "", lead: "" }),
    };

    await connectDB();
    await ProductsSectionSettings.findOneAndUpdate(
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

export async function saveProductsSectionTabLabels(
  tabId: string,
  labels: { en: string; ar: string; de: string },
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }
  const id = (tabId ?? "").trim();
  if (!id) {
    return { ok: false, error: "Missing tab id." };
  }

  try {
    const base = await fetchMergedProductsDocument();
    const tab = base.tabs.find((t) => t.id === id);
    if (!tab) {
      return { ok: false, error: "Tab not found." };
    }
    const nextTab: ProductTabDocument = {
      ...tab,
      en: { label: (labels.en ?? "").trim() },
      ar: { label: (labels.ar ?? "").trim() },
      de: { label: (labels.de ?? "").trim() },
    };
    const tabs = base.tabs.map((t) => (t.id === id ? nextTab : t));
    const payload: ProductsSectionDocument = { ...base, tabs };

    await connectDB();
    await ProductsSectionSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save tab labels." };
  }
}

export async function saveProductsSectionItem(
  tabId: string,
  item: ProductTabItemDocument,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }
  const tid = (tabId ?? "").trim();
  if (!tid) {
    return { ok: false, error: "Missing tab id." };
  }

  const fallback = getFallbackProductsSectionDocument();
  const fbTab =
    fallback.tabs.find((t) => t.id === tid) ?? syntheticProductTab(tid);
  const fbItem = fbTab.items.find((i) => i.itemKey === item.itemKey);
  if (!fbItem) {
    return { ok: false, error: "Unknown product slot." };
  }

  const newRow = normalizeProductItem(item, fbItem);
  if (!newRow.imageSrc) {
    return { ok: false, error: "Product image is required." };
  }

  try {
    const base = await fetchMergedProductsDocument();
    const tab = base.tabs.find((t) => t.id === tid);
    if (!tab) {
      return { ok: false, error: "Tab not found." };
    }
    const oldRow = tab.items.find((r) => r.itemKey === newRow.itemKey);
    const oldUrl = (oldRow?.imageSrc ?? "").trim();
    const newUrl = newRow.imageSrc.trim();
    if (oldUrl && oldUrl !== newUrl && oldUrl.startsWith("/uploads/")) {
      await deletePublicUploadIfSafe(oldUrl);
    }

    const nextItems = tab.items.map((r) => (r.itemKey === newRow.itemKey ? newRow : r));
    const nextTab: ProductTabDocument = { ...tab, items: nextItems };
    const tabs = base.tabs.map((t) => (t.id === tid ? nextTab : t));
    const payload: ProductsSectionDocument = { ...base, tabs };

    await connectDB();
    await ProductsSectionSettings.findOneAndUpdate(
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

export async function addProductsSectionTab(labels: {
  en: string;
  ar: string;
  de: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  try {
    const base = await fetchMergedProductsDocument();
    if (base.tabs.length >= 4) {
      return { ok: false, error: "You can have at most 4 product tabs." };
    }
    const existing = new Set(base.tabs.map((t) => t.id));
    const primary =
      (labels.en ?? "").trim() ||
      (labels.ar ?? "").trim() ||
      (labels.de ?? "").trim() ||
      "tab";
    const id = slugifyTabId(primary, existing);
    const syn = syntheticProductTab(id);
    const draftTab: ProductTabDocument = {
      id,
      en: { label: (labels.en ?? "").trim() },
      ar: { label: (labels.ar ?? "").trim() },
      de: { label: (labels.de ?? "").trim() },
      items: [],
    };
    const newTab = mergeProductTab(draftTab, syn);
    const payload: ProductsSectionDocument = { ...base, tabs: [...base.tabs, newTab] };

    await connectDB();
    await ProductsSectionSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not add tab." };
  }
}

export async function deleteProductsSectionTab(tabId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }
  const id = (tabId ?? "").trim();
  if (!id) {
    return { ok: false, error: "Missing tab id." };
  }

  try {
    const base = await fetchMergedProductsDocument();
    if (base.tabs.length <= 1) {
      return { ok: false, error: "At least one tab must remain." };
    }
    const removed = base.tabs.find((t) => t.id === id);
    if (!removed) {
      return { ok: false, error: "Tab not found." };
    }
    for (const u of collectUploadUrlsFromTab(removed)) {
      await deletePublicUploadIfSafe(u);
    }
    const tabs = base.tabs.filter((t) => t.id !== id);
    const payload: ProductsSectionDocument = { ...base, tabs };

    await connectDB();
    await ProductsSectionSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not delete tab." };
  }
}

export async function reorderProductsTabs(
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  try {
    const base = await fetchMergedProductsDocument();
    const currentIds = base.tabs.map((t) => t.id);
    if (orderedIds.length !== currentIds.length) {
      return { ok: false, error: "Tab order must include every tab exactly once." };
    }
    if (new Set(orderedIds).size !== orderedIds.length) {
      return { ok: false, error: "Duplicate tab id in order." };
    }
    const setCur = new Set(currentIds);
    for (const oid of orderedIds) {
      if (!setCur.has(oid)) {
        return { ok: false, error: "Invalid tab id in order." };
      }
    }
    const map = new Map(base.tabs.map((t) => [t.id, t] as const));
    const tabs = orderedIds.map((oid) => map.get(oid)!).slice(0, 4);
    const payload: ProductsSectionDocument = { ...base, tabs };

    await connectDB();
    await ProductsSectionSettings.findOneAndUpdate(
      { key: "default" },
      { $set: payload },
      { upsert: true, new: true },
    );
    revalidateAllPublic();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not reorder tabs." };
  }
}

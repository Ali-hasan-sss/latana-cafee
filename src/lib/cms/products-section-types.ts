import type { Assets } from "@/lib/data";

export type ProductsLocaleBlock = {
  sub: string;
  title: string;
  lead: string;
};

export type ProductItemLocaleCopy = {
  name: string;
  desc: string;
};

export type ProductTabItemKey = "one" | "two" | "three";

export type ProductTabItemDocument = {
  itemKey: ProductTabItemKey;
  imageSrc: string;
  price: string;
  en: ProductItemLocaleCopy;
  ar: ProductItemLocaleCopy;
  de: ProductItemLocaleCopy;
};

export type ProductTabDocument = {
  id: string;
  en: { label: string };
  ar: { label: string };
  de: { label: string };
  items: ProductTabItemDocument[];
};

export type ProductsSectionDocument = {
  en: ProductsLocaleBlock;
  ar: ProductsLocaleBlock;
  de: ProductsLocaleBlock;
  tabs: ProductTabDocument[];
};

export type ProductTabItemPublic = {
  itemKey: ProductTabItemKey;
  imageSrc: string;
  price: string;
  name: string;
  desc: string;
};

export type ProductTabPublic = {
  id: string;
  label: string;
  items: ProductTabItemPublic[];
};

export type ProductsSectionPublic = ProductsLocaleBlock & {
  tabs: ProductTabPublic[];
};

export type ProductsHeadingsOnly = Pick<ProductsSectionDocument, "en" | "ar" | "de">;

export function pickProductsPublic(doc: ProductsSectionDocument, locale: string): ProductsSectionPublic {
  const sec = locale === "ar" ? doc.ar : locale === "de" ? doc.de : doc.en;
  const tabs = doc.tabs.map((tab) => {
    const label = locale === "ar" ? tab.ar.label : locale === "de" ? tab.de.label : tab.en.label;
    const items = tab.items.map((item) => {
      const copy = locale === "ar" ? item.ar : locale === "de" ? item.de : item.en;
      return {
        itemKey: item.itemKey,
        imageSrc: item.imageSrc,
        price: item.price,
        name: copy.name,
        desc: copy.desc,
      };
    });
    return { id: tab.id, label, items };
  });
  return { sub: sec.sub, title: sec.title, lead: sec.lead, tabs };
}

/** Default images for a tab id (falls back to `main` if unknown). */
export function getProductImagesForTabId(
  productImages: Assets["products"],
  tabId: string,
): string[] {
  const row = productImages[tabId as keyof typeof productImages];
  if (row && Array.isArray(row) && row.length) {
    return [...row].map((s) => String(s ?? "").trim()).filter(Boolean);
  }
  const main = productImages.main;
  return [...main].map((s) => String(s ?? "").trim()).filter(Boolean);
}

import { getAssets } from "@/lib/data";
import type {
  ProductItemLocaleCopy,
  ProductTabDocument,
  ProductTabItemDocument,
  ProductTabItemKey,
  ProductsLocaleBlock,
  ProductsSectionDocument,
} from "./products-section-types";
import { getProductImagesForTabId } from "./products-section-types";

const ITEM_KEYS: ProductTabItemKey[] = ["one", "two", "three"];

function pickStr(a: string, b: string) {
  const t = (a ?? "").trim();
  return t || (b ?? "").trim();
}

function mergeCopy(db: ProductItemLocaleCopy, fb: ProductItemLocaleCopy): ProductItemLocaleCopy {
  return {
    name: pickStr(db.name, fb.name),
    desc: pickStr(db.desc, fb.desc),
  };
}

function mergeSection(db: ProductsLocaleBlock, fb: ProductsLocaleBlock): ProductsLocaleBlock {
  return {
    sub: pickStr(db.sub, fb.sub),
    title: pickStr(db.title, fb.title),
    lead: pickStr(db.lead, fb.lead),
  };
}

export function syntheticProductTab(tabId: string): ProductTabDocument {
  const assets = getAssets();
  const imgs = getProductImagesForTabId(assets.products, tabId);
  const items: ProductTabItemDocument[] = ITEM_KEYS.map((key, idx) => ({
    itemKey: key,
    imageSrc: String(imgs[idx] ?? imgs[0] ?? "").trim(),
    price: "",
    en: { name: "", desc: "" },
    ar: { name: "", desc: "" },
    de: { name: "", desc: "" },
  }));
  return {
    id: tabId,
    en: { label: tabId },
    ar: { label: tabId },
    de: { label: tabId },
    items,
  };
}

function mergeItem(db: ProductTabItemDocument, fb: ProductTabItemDocument): ProductTabItemDocument {
  return {
    itemKey: fb.itemKey,
    imageSrc: pickStr(db.imageSrc, fb.imageSrc),
    price: pickStr(db.price, fb.price),
    en: mergeCopy(db.en, fb.en),
    ar: mergeCopy(db.ar, fb.ar),
    de: mergeCopy(db.de, fb.de),
  };
}

export function mergeProductTab(db: ProductTabDocument, fb: ProductTabDocument): ProductTabDocument {
  const items = ITEM_KEYS.map((key) => {
    const fbItem = fb.items.find((x) => x.itemKey === key);
    if (!fbItem) {
      return syntheticProductTab(db.id).items.find((x) => x.itemKey === key)!;
    }
    const dbItem = db.items.find((x) => x.itemKey === key);
    return dbItem ? mergeItem(dbItem, fbItem) : fbItem;
  });
  return {
    id: db.id,
    en: { label: pickStr(db.en.label, fb.en.label) },
    ar: { label: pickStr(db.ar.label, fb.ar.label) },
    de: { label: pickStr(db.de.label, fb.de.label) },
    items,
  };
}

function normalizeItemKey(k: unknown): ProductTabItemKey {
  return k === "two" || k === "three" ? k : "one";
}

export function leanToProducts(raw: {
  en?: Partial<ProductsLocaleBlock>;
  ar?: Partial<ProductsLocaleBlock>;
  de?: Partial<ProductsLocaleBlock>;
  tabs?: Array<{
    id?: string;
    en?: { label?: string };
    ar?: { label?: string };
    de?: { label?: string };
    items?: Array<{
      itemKey?: string;
      imageSrc?: string;
      price?: string;
      en?: Partial<ProductItemLocaleCopy>;
      ar?: Partial<ProductItemLocaleCopy>;
      de?: Partial<ProductItemLocaleCopy>;
    }>;
  }>;
}): ProductsSectionDocument {
  const loc = (x?: Partial<ProductsLocaleBlock>): ProductsLocaleBlock => ({
    sub: x?.sub ?? "",
    title: x?.title ?? "",
    lead: x?.lead ?? "",
  });
  const copy = (x?: Partial<ProductItemLocaleCopy>): ProductItemLocaleCopy => ({
    name: x?.name ?? "",
    desc: x?.desc ?? "",
  });
  const tabs: ProductTabDocument[] = (raw.tabs ?? []).slice(0, 4).map((tab) => {
    const rows = tab.items ?? [];
    const items: ProductTabItemDocument[] = ITEM_KEYS.map((key) => {
      const row = [...rows].reverse().find((r) => normalizeItemKey(r.itemKey) === key);
      return {
        itemKey: key,
        imageSrc: String(row?.imageSrc ?? "").trim(),
        price: String(row?.price ?? "").trim(),
        en: copy(row?.en),
        ar: copy(row?.ar),
        de: copy(row?.de),
      };
    });
    return {
      id: String(tab.id ?? "").trim(),
      en: { label: String(tab.en?.label ?? "").trim() },
      ar: { label: String(tab.ar?.label ?? "").trim() },
      de: { label: String(tab.de?.label ?? "").trim() },
      items,
    };
  });

  return {
    en: loc(raw.en),
    ar: loc(raw.ar),
    de: loc(raw.de),
    tabs,
  };
}

export function mergeProductsDbWithFallback(
  db: ProductsSectionDocument,
  fallback: ProductsSectionDocument,
): ProductsSectionDocument {
  const mergedLocales = {
    en: mergeSection(db.en, fallback.en),
    ar: mergeSection(db.ar, fallback.ar),
    de: mergeSection(db.de, fallback.de),
  };

  const dbTabs = (db.tabs ?? []).filter((t) => t.id);
  if (dbTabs.length === 0) {
    return {
      ...mergedLocales,
      tabs: fallback.tabs.map((t) => ({
        id: t.id,
        en: { ...t.en },
        ar: { ...t.ar },
        de: { ...t.de },
        items: t.items.map((it) => ({
          ...it,
          en: { ...it.en },
          ar: { ...it.ar },
          de: { ...it.de },
        })),
      })),
    };
  }

  const seen = new Set<string>();
  const out: ProductTabDocument[] = [];
  for (const dt of dbTabs) {
    if (seen.has(dt.id) || out.length >= 4) continue;
    seen.add(dt.id);
    const ft = fallback.tabs.find((t) => t.id === dt.id);
    const fbOrSyn = ft ?? syntheticProductTab(dt.id);
    out.push(mergeProductTab(dt, fbOrSyn));
  }
  return { ...mergedLocales, tabs: out };
}

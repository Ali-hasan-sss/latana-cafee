import type {
  ProductItemLocaleCopy,
  ProductTabDocument,
  ProductTabItemDocument,
  ProductTabItemKey,
  ProductsLocaleBlock,
  ProductsSectionDocument,
} from "./products-section-types";
import { getProductImagesForTabId } from "./products-section-types";
import { getAssets, getCatalog, type Catalog } from "@/lib/data";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import de from "../../../messages/de.json";

const ITEM_KEYS: ProductTabItemKey[] = ["one", "two", "three"];

type ProductsMsgRoot = {
  sub?: string;
  title?: string;
  lead?: string;
  tabs?: Record<string, string | undefined>;
  [tabId: string]: unknown;
};

function sectionBlock(lang: ProductsMsgRoot): ProductsLocaleBlock {
  return {
    sub: lang.sub ?? "",
    title: lang.title ?? "",
    lead: lang.lead ?? "",
  };
}

function readTabLabel(lang: ProductsMsgRoot, labelKey: string): string {
  const tabs = lang.tabs;
  return String(tabs?.[labelKey] ?? "").trim();
}

function readItemCopy(
  lang: ProductsMsgRoot,
  tabId: string,
  itemKey: ProductTabItemKey,
): ProductItemLocaleCopy {
  const tab = lang[tabId] as Record<string, { name?: string; desc?: string } | undefined> | undefined;
  const row = tab?.[itemKey];
  return {
    name: String(row?.name ?? "").trim(),
    desc: String(row?.desc ?? "").trim(),
  };
}

function tabFromCatalogRow(
  row: Catalog["productTabs"][number],
  enM: ProductsMsgRoot,
  arM: ProductsMsgRoot,
  deM: ProductsMsgRoot,
  productImages: ReturnType<typeof getAssets>["products"],
): ProductTabDocument {
  const imgs = getProductImagesForTabId(productImages, row.id);
  const items: ProductTabItemDocument[] = ITEM_KEYS.map((key, idx) => {
    const catItem = row.items.find((i) => i.itemKey === key);
    const price = String(catItem?.price ?? "").trim();
    return {
      itemKey: key,
      imageSrc: String(imgs[idx] ?? imgs[0] ?? "").trim(),
      price,
      en: readItemCopy(enM, row.id, key),
      ar: readItemCopy(arM, row.id, key),
      de: readItemCopy(deM, row.id, key),
    };
  });
  return {
    id: row.id,
    en: { label: readTabLabel(enM, row.labelKey) },
    ar: { label: readTabLabel(arM, row.labelKey) },
    de: { label: readTabLabel(deM, row.labelKey) },
    items,
  };
}

export function getFallbackProductsSectionDocument(): ProductsSectionDocument {
  const { productTabs } = getCatalog();
  const assets = getAssets();
  const enM = en.products as ProductsMsgRoot;
  const arM = ar.products as ProductsMsgRoot;
  const deM = de.products as ProductsMsgRoot;

  return {
    en: sectionBlock(enM),
    ar: sectionBlock(arM),
    de: sectionBlock(deM),
    tabs: productTabs.map((row) => tabFromCatalogRow(row, enM, arM, deM, assets.products)),
  };
}

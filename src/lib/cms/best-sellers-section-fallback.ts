import type {
  BestSellerItemDocument,
  BestSellerItemLocaleCopy,
  BestSellersLocaleSection,
  BestSellersSectionDocument,
} from "./best-sellers-section-types";
import { getAssets, getCatalog } from "@/lib/data";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import de from "../../../messages/de.json";

type ItemMsg = { name?: string; desc?: string };

function sectionBlock(lang: { sub?: string; title?: string; lead?: string }): BestSellersLocaleSection {
  return {
    sub: lang.sub ?? "",
    title: lang.title ?? "",
    lead: lang.lead ?? "",
  };
}

function itemCopy(items: Record<string, ItemMsg>, key: string): BestSellerItemLocaleCopy {
  const b = items[key] ?? {};
  return { name: b.name ?? "", desc: b.desc ?? "" };
}

export function getFallbackBestSellersSectionDocument(): BestSellersSectionDocument {
  const { bestSellers } = getCatalog();
  const assets = getAssets();
  const images = [...assets.bestSellers].map((s) => String(s ?? "").trim()).slice(0, 4);
  while (images.length < 4) {
    images.push("");
  }

  const enItems = (en.bestSellers as { items?: Record<string, ItemMsg> }).items ?? {};
  const arItems = (ar.bestSellers as { items?: Record<string, ItemMsg> }).items ?? {};
  const deItems = (de.bestSellers as { items?: Record<string, ItemMsg> }).items ?? {};

  const items: BestSellerItemDocument[] = bestSellers.map((row, i) => {
    const id = row.itemKey;
    return {
      id,
      imageSrc: images[i] ?? "",
      price: String(row.price ?? "").trim(),
      en: itemCopy(enItems, id),
      ar: itemCopy(arItems, id),
      de: itemCopy(deItems, id),
    };
  });

  return {
    en: sectionBlock(en.bestSellers as BestSellersLocaleSection),
    ar: sectionBlock(ar.bestSellers as BestSellersLocaleSection),
    de: sectionBlock(de.bestSellers as BestSellersLocaleSection),
    items,
  };
}

import type {
  BestSellerItemDocument,
  BestSellerItemLocaleCopy,
  BestSellersLocaleSection,
  BestSellersSectionDocument,
} from "./best-sellers-section-types";

function pickStr(a: string, b: string) {
  const t = (a ?? "").trim();
  return t || (b ?? "").trim();
}

function mergeCopy(db: BestSellerItemLocaleCopy, fb: BestSellerItemLocaleCopy): BestSellerItemLocaleCopy {
  return {
    name: pickStr(db.name, fb.name),
    desc: pickStr(db.desc, fb.desc),
  };
}

function mergeSection(db: BestSellersLocaleSection, fb: BestSellersLocaleSection): BestSellersLocaleSection {
  return {
    sub: pickStr(db.sub, fb.sub),
    title: pickStr(db.title, fb.title),
    lead: pickStr(db.lead, fb.lead),
  };
}

export function leanToBestSellers(raw: {
  en?: Partial<BestSellersLocaleSection>;
  ar?: Partial<BestSellersLocaleSection>;
  de?: Partial<BestSellersLocaleSection>;
  items?: Array<{
    id?: string;
    imageSrc?: string;
    price?: string;
    en?: Partial<BestSellerItemLocaleCopy>;
    ar?: Partial<BestSellerItemLocaleCopy>;
    de?: Partial<BestSellerItemLocaleCopy>;
  }>;
}): BestSellersSectionDocument {
  const loc = (x?: Partial<BestSellersLocaleSection>): BestSellersLocaleSection => ({
    sub: x?.sub ?? "",
    title: x?.title ?? "",
    lead: x?.lead ?? "",
  });
  const copy = (x?: Partial<BestSellerItemLocaleCopy>): BestSellerItemLocaleCopy => ({
    name: x?.name ?? "",
    desc: x?.desc ?? "",
  });
  const items: BestSellerItemDocument[] = (raw.items ?? []).map((row) => ({
    id: row.id ?? "",
    imageSrc: row.imageSrc ?? "",
    price: row.price ?? "",
    en: copy(row.en),
    ar: copy(row.ar),
    de: copy(row.de),
  }));
  return {
    en: loc(raw.en),
    ar: loc(raw.ar),
    de: loc(raw.de),
    items,
  };
}

export function mergeBestSellersDbWithFallback(
  db: BestSellersSectionDocument,
  fallback: BestSellersSectionDocument,
): BestSellersSectionDocument {
  const mergedItems: BestSellerItemDocument[] = fallback.items.map((fb) => {
    const d = db.items.find((x) => x.id === fb.id);
    if (!d) {
      return { ...fb };
    }
    return {
      id: fb.id,
      imageSrc: pickStr(d.imageSrc, fb.imageSrc),
      price: pickStr(d.price, fb.price),
      en: mergeCopy(d.en, fb.en),
      ar: mergeCopy(d.ar, fb.ar),
      de: mergeCopy(d.de, fb.de),
    };
  });
  return {
    en: mergeSection(db.en, fallback.en),
    ar: mergeSection(db.ar, fallback.ar),
    de: mergeSection(db.de, fallback.de),
    items: mergedItems,
  };
}

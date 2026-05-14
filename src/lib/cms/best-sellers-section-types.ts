export type BestSellersLocaleSection = {
  sub: string;
  title: string;
  lead: string;
};

export type BestSellerItemLocaleCopy = {
  name: string;
  desc: string;
};

export type BestSellerItemDocument = {
  id: string;
  imageSrc: string;
  price: string;
  en: BestSellerItemLocaleCopy;
  ar: BestSellerItemLocaleCopy;
  de: BestSellerItemLocaleCopy;
};

export type BestSellersSectionDocument = {
  en: BestSellersLocaleSection;
  ar: BestSellersLocaleSection;
  de: BestSellersLocaleSection;
  items: BestSellerItemDocument[];
};

/** Section headings only (partial CMS update). */
export type BestSellersHeadingsOnly = Pick<BestSellersSectionDocument, "en" | "ar" | "de">;

export type BestSellerPublicItem = {
  id: string;
  imageSrc: string;
  price: string;
  name: string;
  desc: string;
};

export type BestSellersSectionPublic = BestSellersLocaleSection & {
  items: BestSellerPublicItem[];
};

export function pickBestSellersPublic(
  doc: BestSellersSectionDocument,
  locale: string,
): BestSellersSectionPublic {
  const sec = locale === "ar" ? doc.ar : locale === "de" ? doc.de : doc.en;
  const items = doc.items.map((item) => {
    const copy = locale === "ar" ? item.ar : locale === "de" ? item.de : item.en;
    return {
      id: item.id,
      imageSrc: item.imageSrc,
      price: item.price,
      name: copy.name,
      desc: copy.desc,
    };
  });
  return { sub: sec.sub, title: sec.title, lead: sec.lead, items };
}

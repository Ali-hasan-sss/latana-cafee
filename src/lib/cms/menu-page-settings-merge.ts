import type { MenuPageData } from "@/lib/data";
import type { LocalizedString } from "@/lib/menu-page-i18n";
import type { MenuPageCmsDocument } from "@/lib/cms/menu-page-cms-types";

function loc(v: Partial<LocalizedString> | undefined, fb: LocalizedString): LocalizedString {
  return {
    en: (v?.en ?? "").trim() || fb.en,
    ar: (v?.ar ?? "").trim() || fb.ar,
    de: (v?.de ?? "").trim() || fb.de,
  };
}

function normalizeItem(
  item: MenuPageData["pricingColumns"][number]["items"][number] | undefined,
  fbItem: MenuPageData["pricingColumns"][number]["items"][number] | undefined,
): MenuPageData["pricingColumns"][number]["items"][number] {
  const fallback = fbItem ?? {
    image: "",
    price: "0",
    name: { en: "", ar: "", de: "" },
    desc: { en: "", ar: "", de: "" },
  };
  const src = item ?? fallback;
  return {
    image: (src.image ?? "").trim() || fallback.image,
    price: (src.price ?? "").trim() || fallback.price,
    name: loc(src.name, fallback.name),
    desc: loc(src.desc, fallback.desc),
  };
}

function normalizeColumn(
  col: MenuPageData["pricingColumns"][number] | undefined,
  fbCol: MenuPageData["pricingColumns"][number] | undefined,
  index: number,
): MenuPageData["pricingColumns"][number] {
  const fallback =
    fbCol ??
    ({
      id: `col-${index}`,
      title: { en: "Category", ar: "", de: "" },
      items: [],
    } as MenuPageData["pricingColumns"][number]);
  const id = (col?.id ?? "").trim() || fallback.id;
  const items = (col?.items ?? []).map((it, i) => normalizeItem(it, fbCol?.items?.[i]));
  return {
    id,
    title: loc(col?.title, fallback.title),
    items,
  };
}

export function leanToMenuPageCms(raw: {
  heroBackground?: string;
  hero?: Partial<MenuPageData["hero"]>;
  pricingColumns?: Partial<MenuPageData["pricingColumns"][number]>[];
}): MenuPageCmsDocument {
  return {
    heroBackground: String(raw.heroBackground ?? "").trim(),
    hero: {
      title: {
        en: String(raw.hero?.title?.en ?? "").trim(),
        ar: String(raw.hero?.title?.ar ?? "").trim(),
        de: String(raw.hero?.title?.de ?? "").trim(),
      },
      breadcrumbHome: {
        en: String(raw.hero?.breadcrumbHome?.en ?? "").trim(),
        ar: String(raw.hero?.breadcrumbHome?.ar ?? "").trim(),
        de: String(raw.hero?.breadcrumbHome?.de ?? "").trim(),
      },
      breadcrumbCurrent: {
        en: String(raw.hero?.breadcrumbCurrent?.en ?? "").trim(),
        ar: String(raw.hero?.breadcrumbCurrent?.ar ?? "").trim(),
        de: String(raw.hero?.breadcrumbCurrent?.de ?? "").trim(),
      },
    },
    pricingColumns: (raw.pricingColumns ?? []).map((c, i) => ({
      id: String(c?.id ?? "").trim() || `category-${i}`,
      title: {
        en: String(c?.title?.en ?? "").trim(),
        ar: String(c?.title?.ar ?? "").trim(),
        de: String(c?.title?.de ?? "").trim(),
      },
      items: (c?.items ?? []).map((it) => ({
        image: String(it?.image ?? "").trim(),
        price: String(it?.price ?? "").trim(),
        name: {
          en: String(it?.name?.en ?? "").trim(),
          ar: String(it?.name?.ar ?? "").trim(),
          de: String(it?.name?.de ?? "").trim(),
        },
        desc: {
          en: String(it?.desc?.en ?? "").trim(),
          ar: String(it?.desc?.ar ?? "").trim(),
          de: String(it?.desc?.de ?? "").trim(),
        },
      })),
    })),
  };
}

export function mergeMenuPageCmsForAdmin(db: MenuPageCmsDocument, fallback: MenuPageCmsDocument): MenuPageCmsDocument {
  const fbCols = fallback.pricingColumns;
  const dbCols = db.pricingColumns?.length ? db.pricingColumns : fbCols;
  const pricingColumns = dbCols.map((c, i) => normalizeColumn(c, fbCols[i], i));
  return {
    heroBackground: db.heroBackground?.trim() || fallback.heroBackground,
    hero: {
      title: loc(db.hero?.title, fallback.hero.title),
      breadcrumbHome: loc(db.hero?.breadcrumbHome, fallback.hero.breadcrumbHome),
      breadcrumbCurrent: loc(db.hero?.breadcrumbCurrent, fallback.hero.breadcrumbCurrent),
    },
    pricingColumns,
  };
}

export function mergeMenuPageCmsIntoFullBase(cms: MenuPageCmsDocument, base: MenuPageData): MenuPageData {
  const mergedCms = mergeMenuPageCmsForAdmin(cms, {
    heroBackground: base.heroBackground,
    hero: base.hero,
    pricingColumns: base.pricingColumns,
  });
  return {
    ...base,
    ...mergedCms,
  };
}

import { getMenuPage } from "@/lib/data";
import type { MenuPageCmsDocument } from "@/lib/cms/menu-page-cms-types";

export function getFallbackMenuPageCms(): MenuPageCmsDocument {
  const full = getMenuPage();
  return {
    heroBackground: full.heroBackground,
    hero: full.hero,
    pricingColumns: full.pricingColumns,
  };
}

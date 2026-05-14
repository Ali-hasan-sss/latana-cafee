import type { MenuPageData } from "@/lib/data";

/** CMS-managed slice of the public menu page (hero + pricing grid). */
export type MenuPageCmsDocument = Pick<MenuPageData, "heroBackground" | "hero" | "pricingColumns">;

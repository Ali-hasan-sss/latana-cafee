import { getLocale } from "next-intl/server";
import { ProductsTabsSectionClient } from "@/components/sections/ProductsTabsSectionClient";
import { getPublicProductsSection } from "@/lib/cms/get-public-products-section";

export async function ProductsTabsSection() {
  const locale = await getLocale();
  const data = await getPublicProductsSection(locale);

  return <ProductsTabsSectionClient data={data} />;
}

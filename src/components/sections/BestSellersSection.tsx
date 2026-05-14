import { getLocale, getTranslations } from "next-intl/server";
import { AdminFloatingEditLink } from "@/components/admin/AdminFloatingEditLink";
import { BestSellersSectionView } from "@/components/sections/BestSellersSectionView";
import { getPublicBestSellersSection } from "@/lib/cms/get-public-best-sellers-section";
import { hrefForMenu } from "@/lib/i18n/href-menu";

export async function BestSellersSection() {
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const data = await getPublicBestSellersSection(locale);

  return (
    <section className="relative ftco-section best-sellers-section py-20 md:py-28">
      <AdminFloatingEditLink href="/admin/best-sellers-section" />
      <BestSellersSectionView
        data={data}
        viewMoreLabel={tc("viewMore")}
        isRtl={isRtl}
        menuHref={hrefForMenu(locale)}
      />
    </section>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BestSellersSectionAdminPanel } from "@/components/admin/BestSellersSectionAdminPanel";
import { getBestSellersSectionForAdmin } from "@/app/actions/best-sellers-section-admin";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("bestSellers");
}

export default async function AdminBestSellersSectionPage() {
  const bestSellers = await getBestSellersSectionForAdmin();

  const viewMoreLabels = {} as Record<CmsLocale, string>;
  for (const loc of CMS_LOCALES) {
    const t = await getTranslations({ locale: loc, namespace: "common" });
    viewMoreLabels[loc] = t("viewMore");
  }

  return (
    <BestSellersSectionAdminPanel
      initialBestSellers={bestSellers}
      viewMoreLabels={viewMoreLabels}
    />
  );
}

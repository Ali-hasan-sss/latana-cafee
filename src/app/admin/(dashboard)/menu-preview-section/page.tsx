import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MenuPreviewAdminSitePreview } from "@/components/admin/MenuPreviewAdminSitePreview";
import { MenuPreviewSectionAdminPanel } from "@/components/admin/MenuPreviewSectionAdminPanel";
import { getMenuPreviewSectionForAdmin } from "@/app/actions/menu-preview-section-admin";
import { CMS_LOCALES, type CmsLocale } from "@/lib/cms/hero-slider-types";
import { getAssets } from "@/lib/data";
import { adminPageMetadata } from "@/lib/admin/admin-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("menuPreview");
}

export default async function AdminMenuPreviewSectionPage() {
  const menuPreview = await getMenuPreviewSectionForAdmin();
  const { menuPdf } = getAssets();

  const pdfMenuLabels = {} as Record<CmsLocale, string>;
  for (const loc of CMS_LOCALES) {
    const t = await getTranslations({ locale: loc, namespace: "common" });
    pdfMenuLabels[loc] = t("pdfMenu");
  }

  const previewSlot = (
    <MenuPreviewAdminSitePreview document={menuPreview} menuPdf={menuPdf} pdfMenuLabels={pdfMenuLabels} />
  );

  return (
    <MenuPreviewSectionAdminPanel initialMenuPreview={menuPreview} previewSlot={previewSlot} />
  );
}

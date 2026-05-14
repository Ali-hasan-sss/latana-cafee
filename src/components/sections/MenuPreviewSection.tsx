import { getLocale, getTranslations } from "next-intl/server";
import { AdminFloatingEditLink } from "@/components/admin/AdminFloatingEditLink";
import { MenuPreviewSectionView } from "@/components/sections/MenuPreviewSectionView";
import { getPublicMenuPreviewSection } from "@/lib/cms/get-public-menu-preview-section";
import { hrefForMenu } from "@/lib/i18n/href-menu";

export async function MenuPreviewSection() {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const data = await getPublicMenuPreviewSection(locale);
  const menuHref = hrefForMenu(locale);

  return (
    <section id="menu" className="relative ftco-section py-20">
      <AdminFloatingEditLink href="/admin/menu-preview-section" />
      <MenuPreviewSectionView
        sub={data.sub}
        title={data.title}
        text={data.text}
        cta={data.cta}
        gridAria={data.gridAria}
        images={data.images}
        menuPdf={data.menuPdf}
        pdfMenuLabel={t("pdfMenu")}
        isRtl={isRtl}
        menuHref={menuHref}
      />
    </section>
  );
}

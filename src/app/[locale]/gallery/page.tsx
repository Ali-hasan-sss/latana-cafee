import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { GalleryLightboxGrid } from "@/components/sections/GalleryLightboxGrid";
import { IntroBar } from "@/components/sections/IntroBar";
import { MenuPageHero } from "@/components/sections/MenuPageHero";
import { getAssets, getGalleryPage } from "@/lib/data";
import { getPublicGallerySettings } from "@/lib/cms/get-public-gallery-settings";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "galleryPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  const page = getGalleryPage();
  const { pool } = await getPublicGallerySettings();
  const assets = getAssets();

  return (
    <>
      <Navbar />
      <main>
        <MenuPageHero
          data={page.hero}
          bg={page.heroBackground}
          locale={locale}
        />
        <IntroBar />
        <GalleryLightboxGrid images={pool} />
      </main>
      <Footer thumbs={assets.footerBlogThumb} />
    </>
  );
}

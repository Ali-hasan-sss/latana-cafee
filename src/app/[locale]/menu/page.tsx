import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { IntroBar } from "@/components/sections/IntroBar";
import { MenuPageHero } from "@/components/sections/MenuPageHero";
import { MenuPricingSection } from "@/components/sections/MenuPricingSection";
import { getAssets, getMenuPage } from "@/lib/data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "menuPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;
  const data = getMenuPage();
  const assets = getAssets();

  return (
    <>
      <Navbar />
      <main>
        <MenuPageHero data={data.hero} bg={data.heroBackground} locale={locale} />
        <IntroBar />
        <MenuPricingSection columns={data.pricingColumns} locale={locale} />
      </main>
      <Footer thumbs={assets.footerBlogThumb} />
    </>
  );
}

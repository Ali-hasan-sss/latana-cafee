import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BlogListPageGrid } from "@/components/sections/BlogListPageGrid";
import { IntroBar } from "@/components/sections/IntroBar";
import { MenuPageHero } from "@/components/sections/MenuPageHero";
import { getAssets, getBlogPage } from "@/lib/data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blogPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  const page = getBlogPage();
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
        <BlogListPageGrid />
      </main>
      <Footer thumbs={assets.footerBlogThumb} />
    </>
  );
}

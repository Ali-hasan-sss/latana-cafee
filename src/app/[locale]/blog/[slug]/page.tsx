import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BlogArticleBody } from "@/components/sections/BlogArticleBody";
import { BlogArticleHero } from "@/components/sections/BlogArticleHero";
import { IntroBar } from "@/components/sections/IntroBar";
import { getAssets, getBlogArticleBySlug, getBlogArticlesData } from "@/lib/data";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return getBlogArticlesData().articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const article = getBlogArticleBySlug(slug);
  if (!article) return {};
  const t = await getTranslations({
    locale,
    namespace: `blog.posts.${article.postKey}`,
  });
  return {
    title: t("title"),
    description: t("excerpt"),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params;
  if (!getBlogArticleBySlug(slug)) notFound();
  const assets = getAssets();

  return (
    <>
      <Navbar />
      <main>
        <BlogArticleHero slug={slug} locale={locale} />
        <IntroBar />
        <BlogArticleBody slug={slug} locale={locale} />
      </main>
      <Footer thumbs={assets.footerBlogThumb} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BlogArticleBody } from "@/components/sections/BlogArticleBody";
import { BlogArticleHero } from "@/components/sections/BlogArticleHero";
import { IntroBar } from "@/components/sections/IntroBar";
import { getAssets } from "@/lib/data";
import { getPublicBlogPostArticle } from "@/lib/cms/get-public-blog-posts";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPublicBlogPostArticle(slug, locale);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params;
  const article = await getPublicBlogPostArticle(slug, locale);
  if (!article) notFound();
  const assets = getAssets();

  return (
    <>
      <Navbar />
      <main>
        <BlogArticleHero
          locale={locale}
          title={article.title}
          date={article.date}
          excerpt={article.excerpt}
          coverImageSrc={article.coverImageSrc}
        />
        <IntroBar />
        <BlogArticleBody bodyHtml={article.bodyHtml} locale={locale} images={article.images} />
      </main>
      <Footer thumbs={assets.footerBlogThumb} />
    </>
  );
}

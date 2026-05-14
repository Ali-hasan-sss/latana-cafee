import { cache } from "react";
import { getFallbackBlogPostsDocument } from "./blog-cms-fallback";
import { leanToBlogPosts, mergeBlogPostsDbWithFallback } from "./blog-cms-merge";
import {
  pickBlogPostArticle,
  pickBlogPostCard,
  type BlogPostArticlePublic,
  type BlogPostCardPublic,
  type BlogPostDocument,
} from "./blog-cms-types";
import { sanitizeBlogBodyHtml } from "./sanitize-blog-html";
import { connectDB } from "@/lib/db/connect";
import BlogPostsSettings from "@/lib/models/BlogPostsSettings";

export async function fetchMergedBlogPostsDocument() {
  const fb = getFallbackBlogPostsDocument();
  try {
    await connectDB();
    const raw = await BlogPostsSettings.findOne({ key: "default" }).lean().exec();
    if (!raw) return fb;
    const db = leanToBlogPosts(raw as Parameters<typeof leanToBlogPosts>[0]);
    return mergeBlogPostsDbWithFallback(db, fb);
  } catch {
    return fb;
  }
}

function parsePublishedAtMs(iso: string): number {
  const t = Date.parse((iso ?? "").trim());
  return Number.isFinite(t) ? t : 0;
}

/** Newest first (ties broken by slug for stable order). */
export function sortBlogPostsByPublishedAtDesc(posts: BlogPostDocument[]): BlogPostDocument[] {
  return [...posts].sort((a, b) => {
    const diff = parsePublishedAtMs(b.publishedAt) - parsePublishedAtMs(a.publishedAt);
    if (diff !== 0) return diff;
    return a.slug.localeCompare(b.slug);
  });
}

async function getSortedMergedPosts(): Promise<BlogPostDocument[]> {
  const merged = await fetchMergedBlogPostsDocument();
  return sortBlogPostsByPublishedAtDesc(merged.posts);
}

export const getPublicBlogPostCards = cache(async (locale: string): Promise<BlogPostCardPublic[]> => {
  const sorted = await getSortedMergedPosts();
  return sorted.map((p) => pickBlogPostCard(p, locale));
});

/** Latest 3 posts for the home blog section. */
export const getPublicBlogPostCardsHome = cache(async (locale: string): Promise<BlogPostCardPublic[]> => {
  const sorted = await getSortedMergedPosts();
  return sorted.slice(0, 3).map((p) => pickBlogPostCard(p, locale));
});

/** Latest 2 posts for the footer “recent blog” block. */
export const getPublicBlogPostFooterCards = cache(async (locale: string): Promise<BlogPostCardPublic[]> => {
  const sorted = await getSortedMergedPosts();
  return sorted.slice(0, 2).map((p) => pickBlogPostCard(p, locale));
});

export const getPublicBlogPostArticle = cache(
  async (slug: string, locale: string): Promise<BlogPostArticlePublic | null> => {
    const merged = await fetchMergedBlogPostsDocument();
    const post = merged.posts.find((p) => p.slug === slug);
    if (!post) return null;
    const article = pickBlogPostArticle(post, locale);
    return {
      ...article,
      bodyHtml: sanitizeBlogBodyHtml(article.bodyHtml),
    };
  },
);

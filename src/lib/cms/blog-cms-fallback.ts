import type { BlogPostDocument, BlogPostLocaleBlock, BlogPostsDocument } from "./blog-cms-types";
import { getBlogArticlesData, getCatalog, type Catalog } from "@/lib/data";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import de from "../../../messages/de.json";

type PostMsg = {
  date?: string;
  title?: string;
  excerpt?: string;
  body?: string[];
};

type BlogPostsMsg = Record<string, PostMsg | undefined>;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bodyArrayToHtml(paragraphs: string[] | undefined): string {
  if (!paragraphs?.length) return "<p></p>";
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

function localeBlock(postKey: string, posts: BlogPostsMsg): BlogPostLocaleBlock {
  const row = posts[postKey];
  return {
    title: String(row?.title ?? "").trim(),
    date: String(row?.date ?? "").trim(),
    excerpt: String(row?.excerpt ?? "").trim(),
    bodyHtml: bodyArrayToHtml(row?.body),
  };
}

/** Legacy template keys → fixed publish instants (newest first: one > two > three). */
const LEGACY_PUBLISHED_AT: Record<string, string> = {
  one: "2026-03-02T12:00:00.000Z",
  two: "2026-02-18T12:00:00.000Z",
  three: "2026-01-30T12:00:00.000Z",
};

function postFromCatalogRow(
  row: Catalog["blog"][number],
  articles: ReturnType<typeof getBlogArticlesData>["articles"],
  enP: BlogPostsMsg,
  arP: BlogPostsMsg,
  deP: BlogPostsMsg,
): BlogPostDocument | null {
  const art = articles.find((a) => a.postKey === row.postKey);
  if (!art) return null;
  const imgs = (art.images ?? []).map((u) => String(u ?? "").trim()).filter(Boolean);
  const cover = imgs[0] ?? "";
  return {
    id: `legacy-${row.postKey}`,
    slug: art.slug,
    publishedAt: LEGACY_PUBLISHED_AT[row.postKey] ?? "2020-01-01T00:00:00.000Z",
    comments: typeof row.comments === "number" ? row.comments : Number(row.comments) || 0,
    coverImageSrc: cover,
    images: imgs,
    en: localeBlock(row.postKey, enP),
    ar: localeBlock(row.postKey, arP),
    de: localeBlock(row.postKey, deP),
  };
}

export function getFallbackBlogPostsDocument(): BlogPostsDocument {
  const catalog = getCatalog();
  const { articles } = getBlogArticlesData();
  const enP = (en.blog as { posts?: BlogPostsMsg }).posts ?? {};
  const arP = (ar.blog as { posts?: BlogPostsMsg }).posts ?? {};
  const deP = (de.blog as { posts?: BlogPostsMsg }).posts ?? {};

  const posts: BlogPostDocument[] = [];
  for (const row of catalog.blog) {
    const p = postFromCatalogRow(row, articles, enP, arP, deP);
    if (p) posts.push(p);
  }
  return { posts };
}

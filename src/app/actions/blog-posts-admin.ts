"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { deletePublicUploadIfSafe } from "@/lib/cms/delete-public-upload";
import { getFallbackBlogPostsDocument } from "@/lib/cms/blog-cms-fallback";
import { fetchMergedBlogPostsDocument } from "@/lib/cms/get-public-blog-posts";
import { mergeBlogPost, syntheticBlogPost } from "@/lib/cms/blog-cms-merge";
import type { BlogPostDocument, BlogPostsDocument } from "@/lib/cms/blog-cms-types";
import { sanitizeBlogBodyHtml } from "@/lib/cms/sanitize-blog-html";
import { connectDB } from "@/lib/db/connect";
import BlogPostsSettings from "@/lib/models/BlogPostsSettings";
import { routing } from "@/i18n/routing";

function revalidateBlogAll(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/blog");
  const uniq = [...new Set(slugs)].filter(Boolean);
  for (const loc of routing.locales) {
    revalidatePath(`/${loc}`);
    revalidatePath(`/${loc}/blog`);
    for (const s of uniq) {
      revalidatePath(`/${loc}/blog/${s}`);
    }
  }
}

function collectUploadUrlsFromPost(post: BlogPostDocument): string[] {
  const urls: string[] = [];
  const c = (post.coverImageSrc ?? "").trim();
  if (c.startsWith("/uploads/")) urls.push(c);
  for (const u of post.images ?? []) {
    const t = (u ?? "").trim();
    if (t.startsWith("/uploads/")) urls.push(t);
  }
  return urls;
}

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[/\\?#]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizePostBodyFields(post: BlogPostDocument): BlogPostDocument {
  const loc = (b: BlogPostDocument["en"]) => ({
    ...b,
    bodyHtml: sanitizeBlogBodyHtml(b.bodyHtml ?? ""),
  });
  return {
    ...post,
    en: loc(post.en),
    ar: loc(post.ar),
    de: loc(post.de),
  };
}

async function persistPosts(posts: BlogPostDocument[]) {
  await connectDB();
  await BlogPostsSettings.findOneAndUpdate(
    { key: "default" },
    { $set: { posts } },
    { upsert: true, new: true },
  );
}

export async function getBlogPostsForAdmin(): Promise<BlogPostsDocument> {
  const session = await getAdminSession();
  const fallback = getFallbackBlogPostsDocument();
  if (!session) {
    return fallback;
  }
  return fetchMergedBlogPostsDocument();
}

export async function addBlogPost(): Promise<
  { ok: true; id: string; post: BlogPostDocument } | { ok: false; error?: string }
> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  try {
    const base = await fetchMergedBlogPostsDocument();
    const id = crypto.randomUUID();
    let slug = `article-${Date.now()}`;
    const taken = new Set(base.posts.map((p) => p.slug));
    let n = 0;
    while (taken.has(slug)) {
      n += 1;
      slug = `article-${Date.now()}-${n}`;
    }
    const synthetic = syntheticBlogPost(slug, id);
    const draft: BlogPostDocument = {
      id,
      slug,
      publishedAt: new Date().toISOString(),
      comments: 0,
      coverImageSrc: "",
      images: [],
      en: {
        title: "",
        date: "",
        excerpt: "",
        bodyHtml: "<p></p>",
      },
      ar: { title: "", date: "", excerpt: "", bodyHtml: "<p></p>" },
      de: { title: "", date: "", excerpt: "", bodyHtml: "<p></p>" },
    };
    const newPost = mergeBlogPost(draft, synthetic);
    const post = sanitizePostBodyFields(newPost);
    const posts = [...base.posts, post];
    await persistPosts(posts);
    revalidateBlogAll(posts.map((p) => p.slug));
    return { ok: true, id, post };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not add article." };
  }
}

export async function saveBlogPost(post: BlogPostDocument): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  const id = (post.id ?? "").trim();
  const slugNorm = normalizeSlug(post.slug);
  if (!id) {
    return { ok: false, error: "Missing article id." };
  }
  if (!slugNorm) {
    return { ok: false, error: "Slug is required." };
  }

  try {
    const base = await fetchMergedBlogPostsDocument();
    const otherSlugs = base.posts.filter((p) => p.id !== id).map((p) => p.slug);
    if (otherSlugs.includes(slugNorm)) {
      return { ok: false, error: "Another article already uses this slug." };
    }

    const prev = base.posts.find((p) => p.id === id);
    if (!prev) {
      return { ok: false, error: "Article not found." };
    }

    const publishedAtRaw = (post.publishedAt ?? "").trim();
    const publishedAt =
      publishedAtRaw ||
      (prev.publishedAt ?? "").trim() ||
      new Date().toISOString();

    const cleaned: BlogPostDocument = {
      ...post,
      id,
      slug: slugNorm,
      publishedAt,
      comments: typeof post.comments === "number" && Number.isFinite(post.comments) ? post.comments : 0,
      coverImageSrc: (post.coverImageSrc ?? "").trim(),
      images: (post.images ?? []).map((s) => String(s ?? "").trim()).filter(Boolean),
      en: {
        title: (post.en?.title ?? "").trim(),
        date: (post.en?.date ?? "").trim(),
        excerpt: (post.en?.excerpt ?? "").trim(),
        bodyHtml: post.en?.bodyHtml ?? "",
      },
      ar: {
        title: (post.ar?.title ?? "").trim(),
        date: (post.ar?.date ?? "").trim(),
        excerpt: (post.ar?.excerpt ?? "").trim(),
        bodyHtml: post.ar?.bodyHtml ?? "",
      },
      de: {
        title: (post.de?.title ?? "").trim(),
        date: (post.de?.date ?? "").trim(),
        excerpt: (post.de?.excerpt ?? "").trim(),
        bodyHtml: post.de?.bodyHtml ?? "",
      },
    };

    const safe = sanitizePostBodyFields(cleaned);

    const prevUrls = new Set(collectUploadUrlsFromPost(prev));
    const nextPost = safe;
    const nextUrls = new Set(collectUploadUrlsFromPost(nextPost));
    for (const u of prevUrls) {
      if (!nextUrls.has(u)) {
        await deletePublicUploadIfSafe(u);
      }
    }

    const posts = base.posts.map((p) => (p.id === id ? nextPost : p));
    await persistPosts(posts);
    revalidateBlogAll([prev.slug, nextPost.slug]);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save article." };
  }
}

export async function deleteBlogPost(postId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }
  const id = (postId ?? "").trim();
  if (!id) {
    return { ok: false, error: "Missing id." };
  }

  try {
    const base = await fetchMergedBlogPostsDocument();
    const removed = base.posts.find((p) => p.id === id);
    if (!removed) {
      return { ok: false, error: "Article not found." };
    }
    for (const u of collectUploadUrlsFromPost(removed)) {
      await deletePublicUploadIfSafe(u);
    }
    const posts = base.posts.filter((p) => p.id !== id);
    await persistPosts(posts);
    revalidateBlogAll([removed.slug]);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not delete article." };
  }
}

export async function reorderBlogPosts(
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, error: "Unauthorized." };
  }

  try {
    const base = await fetchMergedBlogPostsDocument();
    const currentIds = base.posts.map((p) => p.id);
    if (orderedIds.length !== currentIds.length) {
      return { ok: false, error: "Order must list every article exactly once." };
    }
    if (new Set(orderedIds).size !== orderedIds.length) {
      return { ok: false, error: "Duplicate id in order." };
    }
    const setCur = new Set(currentIds);
    for (const oid of orderedIds) {
      if (!setCur.has(oid)) {
        return { ok: false, error: "Invalid id in order." };
      }
    }
    const map = new Map(base.posts.map((p) => [p.id, p] as const));
    const posts = orderedIds.map((oid) => map.get(oid)!);
    await persistPosts(posts);
    revalidateBlogAll(posts.map((p) => p.slug));
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not reorder articles." };
  }
}

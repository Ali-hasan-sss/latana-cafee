import type { BlogPostDocument, BlogPostLocaleBlock, BlogPostsDocument } from "./blog-cms-types";

function pickStr(a: string, b: string) {
  const t = (a ?? "").trim();
  return t || (b ?? "").trim();
}

function mergeLocale(db: BlogPostLocaleBlock, fb: BlogPostLocaleBlock): BlogPostLocaleBlock {
  return {
    title: pickStr(db.title, fb.title),
    date: pickStr(db.date, fb.date),
    excerpt: pickStr(db.excerpt, fb.excerpt),
    bodyHtml: pickStr(db.bodyHtml, fb.bodyHtml),
  };
}

export function syntheticBlogPost(slug: string, id: string): BlogPostDocument {
  const empty: BlogPostLocaleBlock = { title: "", date: "", excerpt: "", bodyHtml: "<p></p>" };
  return {
    id,
    slug,
    publishedAt: "",
    comments: 0,
    coverImageSrc: "",
    images: [],
    en: { ...empty },
    ar: { ...empty },
    de: { ...empty },
  };
}

export function mergeBlogPost(db: BlogPostDocument, fb: BlogPostDocument): BlogPostDocument {
  const cover = pickStr(db.coverImageSrc, fb.coverImageSrc);
  const imgs =
    db.images?.filter(Boolean).length > 0 ? [...db.images] : [...(fb.images ?? [])];
  return {
    id: db.id,
    slug: (db.slug ?? "").trim() || fb.slug,
    publishedAt: (() => {
      const v = pickStr(db.publishedAt, fb.publishedAt).trim();
      return v || "1970-01-01T00:00:00.000Z";
    })(),
    comments: typeof db.comments === "number" && Number.isFinite(db.comments) ? db.comments : fb.comments,
    coverImageSrc: cover || imgs[0] || "",
    images: imgs.length ? imgs : [...(fb.images ?? [])],
    en: mergeLocale(db.en, fb.en),
    ar: mergeLocale(db.ar, fb.ar),
    de: mergeLocale(db.de, fb.de),
  };
}

export function leanToBlogPosts(raw: {
  posts?: Array<{
    id?: string;
    slug?: string;
    publishedAt?: string;
    comments?: number;
    coverImageSrc?: string;
    images?: string[];
    en?: Partial<BlogPostLocaleBlock>;
    ar?: Partial<BlogPostLocaleBlock>;
    de?: Partial<BlogPostLocaleBlock>;
  }>;
}): BlogPostsDocument {
  const loc = (x?: Partial<BlogPostLocaleBlock>): BlogPostLocaleBlock => ({
    title: x?.title ?? "",
    date: x?.date ?? "",
    excerpt: x?.excerpt ?? "",
    bodyHtml: x?.bodyHtml ?? "",
  });
  const posts: BlogPostDocument[] = (raw.posts ?? []).map((row) => ({
    id: String(row.id ?? "").trim(),
    slug: String(row.slug ?? "").trim(),
    publishedAt: String(row.publishedAt ?? "").trim(),
    comments: typeof row.comments === "number" ? row.comments : Number(row.comments) || 0,
    coverImageSrc: String(row.coverImageSrc ?? "").trim(),
    images: Array.isArray(row.images) ? row.images.map((s) => String(s ?? "").trim()).filter(Boolean) : [],
    en: loc(row.en),
    ar: loc(row.ar),
    de: loc(row.de),
  }));
  return { posts };
}

export function mergeBlogPostsDbWithFallback(db: BlogPostsDocument, fb: BlogPostsDocument): BlogPostsDocument {
  const dbPosts = (db.posts ?? []).filter((p) => p.id && p.slug);
  if (dbPosts.length === 0) {
    return {
      posts: fb.posts.map((p) => ({
        ...p,
        en: { ...p.en },
        ar: { ...p.ar },
        de: { ...p.de },
        images: [...p.images],
      })),
    };
  }
  const out: BlogPostDocument[] = [];
  for (const dp of dbPosts) {
    const fbp = fb.posts.find((x) => x.slug === dp.slug || x.id === dp.id);
    if (fbp) {
      out.push(mergeBlogPost(dp, fbp));
    } else {
      out.push(mergeBlogPost(dp, syntheticBlogPost(dp.slug || "post", dp.id)));
    }
  }
  return { posts: out };
}

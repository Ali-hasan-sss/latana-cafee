export type BlogPostLocaleBlock = {
  title: string;
  date: string;
  excerpt: string;
  bodyHtml: string;
};

export type BlogPostDocument = {
  id: string;
  slug: string;
  /** ISO 8601 — used to pick newest posts for home/footer/list */
  publishedAt: string;
  comments: number;
  coverImageSrc: string;
  images: string[];
  en: BlogPostLocaleBlock;
  ar: BlogPostLocaleBlock;
  de: BlogPostLocaleBlock;
};

export type BlogPostsDocument = {
  posts: BlogPostDocument[];
};

export type BlogPostCardPublic = {
  id: string;
  slug: string;
  comments: number;
  coverImageSrc: string;
  title: string;
  date: string;
  excerpt: string;
};

export type BlogPostArticlePublic = BlogPostCardPublic & {
  bodyHtml: string;
  images: string[];
};

function pickLocaleBlock(doc: BlogPostDocument, locale: string): BlogPostLocaleBlock {
  if (locale === "ar") return doc.ar;
  if (locale === "de") return doc.de;
  return doc.en;
}

export function pickBlogPostCard(doc: BlogPostDocument, locale: string): BlogPostCardPublic {
  const b = pickLocaleBlock(doc, locale);
  const cover = (doc.coverImageSrc ?? "").trim() || doc.images[0] || "";
  return {
    id: doc.id,
    slug: doc.slug,
    comments: doc.comments,
    coverImageSrc: cover,
    title: b.title,
    date: b.date,
    excerpt: b.excerpt,
  };
}

export function pickBlogPostArticle(doc: BlogPostDocument, locale: string): BlogPostArticlePublic {
  const card = pickBlogPostCard(doc, locale);
  const b = pickLocaleBlock(doc, locale);
  return { ...card, bodyHtml: b.bodyHtml, images: [...doc.images] };
}

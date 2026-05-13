import assets from "../../data/assets.json";
import blogArticles from "../../data/blog-articles.json";
import blogPage from "../../data/blog-page.json";
import catalog from "../../data/catalog.json";
import galleryPage from "../../data/gallery-page.json";
import menuPage from "../../data/menu-page.json";
import services from "../../data/services.json";

export type Assets = typeof assets;
export type BlogArticlesData = typeof blogArticles;
export type BlogPageData = typeof blogPage;
export type Catalog = typeof catalog;
export type GalleryPageData = typeof galleryPage;
export type MenuPageData = typeof menuPage;
export type ServicesData = typeof services;

export function getAssets(): Assets {
  return assets;
}

export function getCatalog(): Catalog {
  return catalog;
}

export function getServicesData(): ServicesData {
  return services;
}

export function getMenuPage(): MenuPageData {
  return menuPage;
}

export function getGalleryPage(): GalleryPageData {
  return galleryPage;
}

export function getBlogPage(): BlogPageData {
  return blogPage;
}

export function getBlogArticlesData(): BlogArticlesData {
  return blogArticles;
}

export function getBlogArticleBySlug(slug: string) {
  return blogArticles.articles.find((a) => a.slug === slug);
}

export type ServiceLocaleCopy = {
  title: string;
  text: string;
};

export function getServiceCopy(
  item: ServicesData["items"][number],
  locale: string,
): ServiceLocaleCopy {
  const key = locale === "ar" || locale === "de" ? locale : "en";
  const block = item[key as "en" | "ar" | "de"];
  return block ?? item.en;
}

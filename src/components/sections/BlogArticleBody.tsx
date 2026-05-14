import { Container } from "@/components/ui/Container";
import { sanitizeBlogBodyHtml } from "@/lib/cms/sanitize-blog-html";
import { BlogArticleInstagramGallery } from "@/components/sections/BlogArticleInstagramGallery";

type Props = {
  bodyHtml: string;
  locale: string;
  images: string[];
};

export async function BlogArticleBody({ bodyHtml, locale, images }: Props) {
  const safe = sanitizeBlogBodyHtml(bodyHtml);
  if (!safe.trim() || safe === "<p></p>") {
    return null;
  }

  return (
    <section className="border-t border-black/[0.06] bg-brand-cream py-14 md:py-20">
      <Container>
        <div className="[direction:ltr] grid items-start gap-12 lg:grid-cols-2 lg:gap-14">
          <article
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="article-body blog-rich-html min-w-0 lg:order-1"
            dangerouslySetInnerHTML={{ __html: safe }}
          />

          <aside className="min-w-0 lg:order-2">
            <BlogArticleInstagramGallery images={images} />
          </aside>
        </div>
      </Container>
    </section>
  );
}

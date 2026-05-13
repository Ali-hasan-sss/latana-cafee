import { getMessages } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { getBlogArticleBySlug } from "@/lib/data";
import { BlogArticleInstagramGallery } from "@/components/sections/BlogArticleInstagramGallery";

type PostBlock = { body?: string[] };

type Props = {
  slug: string;
  locale: string;
};

export async function BlogArticleBody({ slug, locale }: Props) {
  const article = getBlogArticleBySlug(slug);
  if (!article) return null;

  const messages = (await getMessages({ locale })) as {
    blog?: { posts?: Record<string, PostBlock> };
  };
  const body = messages.blog?.posts?.[article.postKey]?.body;
  if (!body?.length) return null;

  return (
    <section className="border-t border-black/[0.06] bg-brand-cream py-14 md:py-20">
      <Container>
        <div className="[direction:ltr] grid items-start gap-12 lg:grid-cols-2 lg:gap-14">
          <article
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="article-body min-w-0 space-y-5 lg:order-1"
          >
            <div className="space-y-5">
              {body.map((paragraph, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? "text-lg font-medium leading-relaxed text-brand-dark md:text-xl"
                      : "text-[1.05rem] leading-[1.85] text-brand-dark/88 md:text-lg"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>

          <aside className="min-w-0 lg:order-2">
            <BlogArticleInstagramGallery images={article.images} />
          </aside>
        </div>
      </Container>
    </section>
  );
}

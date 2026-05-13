import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { getBlogArticlesData, getCatalog } from "@/lib/data";

function IconChat({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export async function BlogListPageGrid() {
  const t = await getTranslations("blog");
  const tp = await getTranslations("blog.posts");
  const catalog = getCatalog();
  const articles = getBlogArticlesData().articles;

  const slugFor = (postKey: string) =>
    articles.find((a) => a.postKey === postKey)?.slug;

  return (
    <section className="blog-section bg-brand-darker py-16 md:py-24">
      <Container>
        <header className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">
            {t("lead")}
          </p>
        </header>
        <div className="row -mx-3 flex flex-wrap">
          {catalog.blog.map((post, i) => {
            const slug = slugFor(post.postKey);
            if (!slug) return null;
            const art = articles.find((a) => a.postKey === post.postKey);
            const cover = art?.images[0] ?? "/images/2f0ab6f7-bfb7-44bd-9d16-96419ba2020f.jpg.jpeg";
            const title = tp(`${post.postKey}.title`);
            return (
              <div
                key={post.postKey}
                className="col-md-4 flex w-full px-3 md:w-1/3"
                data-aos="fade-up"
                data-aos-duration="800"
                data-aos-delay={String(i * 120)}
              >
                <article className="blog-entry flex w-full flex-col self-stretch">
                  <Link
                    href={`/blog/${slug}`}
                    className="block-20 relative block min-h-[220px] w-full overflow-hidden md:min-h-[260px]"
                    style={{ backgroundImage: `url(${cover})` }}
                    aria-label={title}
                  />
                  <div className="text block flex flex-1 flex-col py-4">
                    <div className="meta">
                      <div>
                        <Link href={`/blog/${slug}`} className="no-underline">
                          {tp(`${post.postKey}.date`)}
                        </Link>
                      </div>
                      <div>
                        <Link href={`/blog/${slug}`} className="no-underline">
                          {t("admin")}
                        </Link>
                      </div>
                      <div>
                        <Link
                          href={`/blog/${slug}`}
                          className="meta-chat no-underline"
                        >
                          <span
                            className="icon-chat inline-flex align-middle"
                            aria-hidden
                          >
                            <IconChat className="h-3.5 w-3.5" />
                          </span>{" "}
                          {post.comments}
                        </Link>
                      </div>
                    </div>
                    <h2 className="heading mt-2 text-lg md:text-xl">
                      <Link href={`/blog/${slug}`} className="no-underline">
                        {title}
                      </Link>
                    </h2>
                    <p className="mt-1 flex-1">{tp(`${post.postKey}.excerpt`)}</p>
                    <div className="mt-4">
                      <Link
                        href={`/blog/${slug}`}
                        className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary no-underline transition hover:text-brand-primary-hover"
                      >
                        {t("readMore")}
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { getPublicBlogPostCards } from "@/lib/cms/get-public-blog-posts";

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
  const locale = await getLocale();
  const cards = await getPublicBlogPostCards(locale);

  return (
    <section className="blog-section bg-brand-darker py-16 md:py-24">
      <Container>
        <header className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">{t("title")}</h1>
          <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">{t("lead")}</p>
        </header>
        <div className="row -mx-3 flex flex-wrap">
          {cards.map((post, i) => {
            const href = `/blog/${post.slug}`;
            const cover = post.coverImageSrc;
            return (
              <div
                key={post.id}
                className="col-md-4 my-4 flex w-full px-3  md:w-1/3"
                data-aos="fade-up"
                data-aos-duration="800"
                data-aos-delay={String(i * 120)}
              >
                <article className="blog-entry flex h-full w-full flex-col self-stretch overflow-hidden rounded-2xl border border-white/10 bg-black/25 shadow-[0_16px_48px_rgba(0,0,0,0.35)] transition hover:border-brand-primary/25 hover:shadow-[0_20px_56px_rgba(0,0,0,0.45)]">
                  <Link
                    href={href}
                    className="block-20 relative block min-h-[220px] w-full overflow-hidden md:min-h-[260px]"
                    style={{ backgroundImage: `url(${cover})` }}
                    aria-label={post.title}
                  />
                  <div className="text block flex flex-1 flex-col px-1 py-4 sm:px-2">
                    <div className="meta">
                      <div>
                        <Link href={href} className="no-underline">
                          {post.date}
                        </Link>
                      </div>
                      <div>
                        <Link href={href} className="no-underline">
                          {t("admin")}
                        </Link>
                      </div>
                      <div>
                        <Link href={href} className="meta-chat no-underline">
                          <span className="icon-chat inline-flex align-middle" aria-hidden>
                            <IconChat className="h-3.5 w-3.5" />
                          </span>{" "}
                          {post.comments}
                        </Link>
                      </div>
                    </div>
                    <h2 className="heading mt-2 text-lg md:text-xl">
                      <Link href={href} className="no-underline">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-1 flex-1">{post.excerpt}</p>
                    <div className="mt-4">
                      <Link
                        href={href}
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

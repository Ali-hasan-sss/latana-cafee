import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminFloatingEditLink } from "@/components/admin/AdminFloatingEditLink";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicBlogPostCardsHome } from "@/lib/cms/get-public-blog-posts";

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

export async function BlogSection() {
  const t = await getTranslations("blog");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const cards = await getPublicBlogPostCardsHome(locale);

  return (
    <section id="blog" className="blog-section relative py-16 md:py-24">
      <AdminFloatingEditLink href="/admin/blog-posts" label="Edit blog" />
      <Container>
        <SectionHeading
          title={t("title")}
          lead={t("lead")}
          className="[&_h2]:text-white [&_p]:text-white/75"
          moreHref="/blog"
          moreLabel={tc("viewMore")}
          moreButtonClassName="inline-flex items-center justify-center border border-white/70 bg-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white no-underline transition hover:bg-white hover:text-brand-dark"
        />
        <div className="row -mx-3 flex flex-wrap">
          {cards.map((post, i) => {
            const href = `/blog/${post.slug}`;
            const src = post.coverImageSrc;
            return (
              <div
                key={post.id}
                className="col-md-4 flex w-full px-3 md:w-1/3 ftco-animate fadeInUp ftco-animated"
                data-aos="fade-up"
                data-aos-duration="800"
                data-aos-delay={String(i * 120)}
              >
                <div className="blog-entry flex h-full w-full flex-col self-stretch overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition hover:border-white/20">
                  <Link
                    href={href}
                    className="block-20"
                    style={{ backgroundImage: `url(${src})` }}
                    aria-label={post.title}
                  />
                  <div className="text block py-4">
                    <div className="meta">
                      <div>
                        <Link href={href}>{post.date}</Link>
                      </div>
                      <div>
                        <Link href={href}>{t("admin")}</Link>
                      </div>
                      <div>
                        <Link href={href} className="meta-chat">
                          <span className="icon-chat inline-flex align-middle" aria-hidden>
                            <IconChat className="h-3.5 w-3.5" />
                          </span>{" "}
                          {post.comments}
                        </Link>
                      </div>
                    </div>
                    <h3 className="heading mt-2">
                      <Link href={href}>{post.title}</Link>
                    </h3>
                    <p>{post.excerpt}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

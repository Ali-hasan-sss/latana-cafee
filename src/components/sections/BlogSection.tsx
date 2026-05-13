import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getBlogArticlesData } from "@/lib/data";
import type { Catalog } from "@/lib/data";

type Props = {
  images: string[];
  posts: Catalog["blog"];
};

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

export async function BlogSection({ images, posts }: Props) {
  const t = await getTranslations("blog");
  const tp = await getTranslations("blog.posts");
  const tc = await getTranslations("common");
  const articles = getBlogArticlesData().articles;
  const slugFor = (postKey: string) =>
    articles.find((a) => a.postKey === postKey)?.slug;

  return (
    <section id="blog" className="blog-section py-16 md:py-24">
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
          {posts.map((post, i) => {
            const slug = slugFor(post.postKey);
            const href = slug ? `/blog/${slug}` : "/blog";
            const art = articles.find((a) => a.postKey === post.postKey);
            const src = art?.images[0] ?? images[i] ?? images[0];
            const title = tp(`${post.postKey}.title`);
            return (
              <div
                key={post.postKey}
                className="col-md-4 flex w-full px-3 md:w-1/3 ftco-animate fadeInUp ftco-animated"
                data-aos="fade-up"
                data-aos-duration="800"
                data-aos-delay={String(i * 120)}
              >
                <div className="blog-entry flex w-full flex-col self-stretch">
                  <Link
                    href={href}
                    className="block-20"
                    style={{ backgroundImage: `url(${src})` }}
                    aria-label={title}
                  />
                  <div className="text block py-4">
                    <div className="meta">
                      <div>
                        <Link href={href}>{tp(`${post.postKey}.date`)}</Link>
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
                      <Link href={href}>{title}</Link>
                    </h3>
                    <p>{tp(`${post.postKey}.excerpt`)}</p>
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

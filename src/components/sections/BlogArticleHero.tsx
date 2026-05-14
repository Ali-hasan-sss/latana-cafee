import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { getBlogPage } from "@/lib/data";
import { pickLocalized } from "@/lib/menu-page-i18n";

type Props = {
  locale: string;
  title: string;
  date: string;
  excerpt: string;
  coverImageSrc: string;
};

export async function BlogArticleHero({ locale, title, date, excerpt, coverImageSrc }: Props) {
  const tBlog = await getTranslations({ locale, namespace: "blog" });
  const page = getBlogPage();
  const homeLabel = pickLocalized(page.hero.breadcrumbHome, locale);
  const blogLabel = pickLocalized(page.hero.breadcrumbCurrent, locale);
  const cover =
    coverImageSrc.trim() || "/images/2f0ab6f7-bfb7-44bd-9d16-96419ba2020f.jpg.jpeg";

  return (
    <section className="menu-page-slider relative w-full">
      <div
        className="slider-item relative flex min-h-[38vh] w-full items-end justify-center overflow-hidden bg-cover bg-center bg-no-repeat pb-10 pt-28 md:min-h-[44vh] md:pb-14 md:pt-32"
        style={{ backgroundImage: `url(${cover})` }}
      >
        <div className="overlay absolute inset-0 bg-black/50" aria-hidden />
        <div className="relative z-10 w-full px-4 text-white">
          <Container>
            <nav
              aria-label="Breadcrumb"
              className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 md:text-xs"
            >
              <Link
                href="/"
                className="text-white transition-colors hover:text-brand-primary"
              >
                {homeLabel}
              </Link>
              <span className="text-white/45" aria-hidden>
                /
              </span>
              <Link
                href="/blog"
                className="text-white transition-colors hover:text-brand-primary"
              >
                {blogLabel}
              </Link>
              <span className="text-white/45" aria-hidden>
                /
              </span>
              <span className="line-clamp-1 text-brand-primary">{title}</span>
            </nav>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{date}</p>
            <h1 className="max-w-4xl font-display text-2xl font-semibold uppercase leading-tight tracking-[0.06em] text-white md:text-3xl lg:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">{excerpt}</p>
            <p className="mt-3 text-xs text-white/60">{tBlog("admin")}</p>
          </Container>
        </div>
      </div>
    </section>
  );
}

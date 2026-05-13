import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import type { LocalizedString } from "@/lib/menu-page-i18n";
import { pickLocalized } from "@/lib/menu-page-i18n";

type InnerPageHero = {
  title: LocalizedString;
  breadcrumbHome: LocalizedString;
  breadcrumbCurrent: LocalizedString;
};

type Props = {
  data: InnerPageHero;
  bg: string;
  locale: string;
};

export function MenuPageHero({ data, bg, locale }: Props) {
  const title = pickLocalized(data.title, locale);
  const homeLabel = pickLocalized(data.breadcrumbHome, locale);
  const currentLabel = pickLocalized(data.breadcrumbCurrent, locale);

  return (
    <section className="menu-page-slider min-h-[100vh] relative w-full">
      <div
        className="slider-item relative flex h-screen w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat "
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="overlay absolute inset-0 bg-black/45" aria-hidden />
        <div className="relative z-10 w-full px-4 py-16 pt-28 text-center text-white md:pt-32 md:pb-20">
          <Container>
            <h1 className="mb-2 font-display text-3xl font-semibold uppercase tracking-[0.12em] text-white md:text-4xl lg:text-5xl">
              {title}
            </h1>
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 md:text-xs"
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
              <span className="text-brand-primary">{currentLabel}</span>
            </nav>
          </Container>
        </div>
      </div>
    </section>
  );
}

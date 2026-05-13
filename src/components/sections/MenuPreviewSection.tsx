import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

type Props = {
  images: string[];
  menuPdf: string;
};

export async function MenuPreviewSection({ images, menuPdf }: Props) {
  const t = await getTranslations("menuSection");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const cells = images.slice(0, 4);

  return (
    <section id="menu" className="ftco-section py-20">
      <Container className="container">
        <div className="row align-items-center -mx-3 flex flex-wrap items-center">
          <div className="col-md-6 w-full px-3 pr-md-5 md:w-1/2">
            <div
              className="heading-section text-md-right ftco-animate fadeInUp ftco-animated"
              data-aos="fade-up"
              data-aos-duration="800"
            >
              {isRtl ? (
                <span className="subheading mb-2 block text-lg font-semibold tracking-wide text-brand-primary md:text-xl">
                  {t("sub")}
                </span>
              ) : (
                <span className="subheading mb-2 block font-accent text-3xl text-brand-light md:text-4xl">
                  {t("sub")}
                </span>
              )}
              <h2 className="mb-4 font-display text-3xl font-semibold text-brand-light md:text-4xl">
                {t("title")}
              </h2>
              <p className="mb-6 text-base leading-relaxed text-brand-light md:text-lg">
                {t("text")}
              </p>
              <p className="mb-0 flex flex-wrap items-center gap-4">
                <Link
                  href="/menu"
                  className="btn btn-primary btn-outline-primary inline-flex px-4 py-3 no-underline"
                >
                  {t("cta")}
                </Link>
                <a
                  href={menuPdf}
                  className="text-sm font-medium text-brand-primary underline decoration-brand-primary/50 underline-offset-4 transition hover:text-white hover:decoration-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tc("pdfMenu")}
                </a>
              </p>
            </div>
          </div>
          <div className="col-md-6 w-full px-3 md:w-1/2">
            <div
              className="row -mx-3 flex flex-wrap"
              aria-label={t("gridAria")}
            >
              {cells.map((src, i) => (
                <div key={src} className="col-md-6 w-full px-3 md:w-1/2">
                  <div
                    className={
                      i % 2 === 1 ? "menu-entry mt-lg-4" : "menu-entry"
                    }
                    data-aos="zoom-in"
                    data-aos-duration="800"
                    data-aos-delay={String(80 + i * 100)}
                  >
                    <Link
                      href="/menu"
                      className="img"
                      style={{ backgroundImage: `url(${src})` }}
                      aria-label={t("cta")}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

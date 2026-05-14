"use client";

import NextLink from "next/link";
import { Container } from "@/components/ui/Container";

export type MenuPreviewSectionViewProps = {
  sub: string;
  title: string;
  text: string;
  cta: string;
  gridAria: string;
  images: string[];
  menuPdf: string;
  pdfMenuLabel: string;
  isRtl: boolean;
  menuHref: string;
};

/**
 * Presentational block shared by the home page and the admin “live preview”.
 * Client-only so the admin preview (with locale tabs) can reuse the same markup/classes.
 */
export function MenuPreviewSectionView({
  sub,
  title,
  text,
  cta,
  gridAria,
  images,
  menuPdf,
  pdfMenuLabel,
  isRtl,
  menuHref,
}: MenuPreviewSectionViewProps) {
  const cells = images.slice(0, 4);

  return (
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
                {sub}
              </span>
            ) : (
              <span className="subheading mb-2 block font-accent text-3xl text-brand-light md:text-4xl">
                {sub}
              </span>
            )}
            <h2 className="mb-4 font-display text-3xl font-semibold text-brand-light md:text-4xl">{title}</h2>
            <p className="mb-6 text-base leading-relaxed text-brand-light md:text-lg">{text}</p>
            <p className="mb-0 flex flex-wrap items-center gap-4">
              <NextLink
                href={menuHref}
                className="btn btn-primary btn-outline-primary inline-flex px-4 py-3 no-underline"
              >
                {cta}
              </NextLink>
              <a
                href={menuPdf}
                className="text-sm font-medium text-brand-primary underline decoration-brand-primary/50 underline-offset-4 transition hover:text-white hover:decoration-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                {pdfMenuLabel}
              </a>
            </p>
          </div>
        </div>
        <div className="col-md-6 w-full px-3 md:w-1/2">
          <div className="row -mx-3 flex flex-wrap" aria-label={gridAria}>
            {cells.map((src, i) => (
              <div key={`menu-preview-${i}`} className="col-md-6 w-full px-3 md:w-1/2">
                <div
                  className={i % 2 === 1 ? "menu-entry mt-lg-4" : "menu-entry"}
                  data-aos="zoom-in"
                  data-aos-duration="800"
                  data-aos-delay={String(80 + i * 100)}
                >
                  <NextLink
                    href={menuHref}
                    className="img"
                    style={{ backgroundImage: `url(${src})` }}
                    aria-label={cta}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

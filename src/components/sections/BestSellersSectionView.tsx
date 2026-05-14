"use client";

import NextLink from "next/link";
import { Container } from "@/components/ui/Container";
import type { BestSellersSectionPublic } from "@/lib/cms/best-sellers-section-types";

export type BestSellersSectionViewProps = {
  data: BestSellersSectionPublic;
  viewMoreLabel: string;
  isRtl: boolean;
  menuHref: string;
  /** Admin preview: non-interactive “View more” control for layout parity */
  preview?: boolean;
};

export function BestSellersSectionView({
  data,
  viewMoreLabel,
  isRtl,
  menuHref,
  preview = false,
}: BestSellersSectionViewProps) {
  const ctaClass =
    "inline-flex border border-white/70 bg-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white no-underline transition hover:bg-white hover:text-brand-dark";

  return (
    <Container className="container">
      <div className="mb-12 flex justify-center pb-3 md:mb-14 md:pb-5">
        <div className="heading-section ftco-animate fadeInUp ftco-animated col-md-7 w-full max-w-2xl text-center">
          {isRtl ? (
            <span className="subheading mb-2 block text-lg font-semibold tracking-wide text-brand-primary md:text-xl">
              {data.sub}
            </span>
          ) : (
            <span className="subheading mb-2 block font-accent text-3xl text-brand-primary md:text-4xl">
              {data.sub}
            </span>
          )}
          <h2 className="mb-4 font-display text-3xl font-semibold uppercase tracking-wide text-white md:text-4xl">
            {data.title}
          </h2>
          <p className="mx-auto text-base leading-relaxed text-white/65 md:text-lg">{data.lead}</p>
          <div className="mt-8 flex justify-center">
            {preview ? (
              <span className={`${ctaClass} pointer-events-none cursor-default opacity-90`}>
                {viewMoreLabel}
              </span>
            ) : (
              <NextLink href={menuHref} className={ctaClass}>
                {viewMoreLabel}
              </NextLink>
            )}
          </div>
        </div>
      </div>
      <div className="row -mx-3 flex flex-wrap">
        {data.items.map((item, i) => (
          <div key={item.id} className="col-md-3 w-full px-3 md:w-1/2 lg:w-1/4">
            <div className="menu-entry">
              {preview ? (
                <div
                  className="img cursor-default"
                  style={{ backgroundImage: `url(${item.imageSrc})` }}
                  aria-hidden
                />
              ) : (
                <NextLink
                  href={menuHref}
                  className="img"
                  style={{ backgroundImage: `url(${item.imageSrc})` }}
                  aria-label={item.name}
                />
              )}
              <div className="text text-center pt-4">
                <h3>
                  {preview ? (
                    <span className="text-white">{item.name}</span>
                  ) : (
                    <NextLink href={menuHref}>{item.name}</NextLink>
                  )}
                </h3>
                <p>{item.desc}</p>
                <p className="price">
                  <span>€{item.price}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}

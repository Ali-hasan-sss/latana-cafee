"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import type { Assets } from "@/lib/data";
import type { Catalog } from "@/lib/data";

type Props = {
  productImages: Assets["products"];
  tabs: Catalog["productTabs"];
};

export function ProductsTabsSection({ productImages, tabs }: Props) {
  const [active, setActive] = useState(tabs[0]?.id ?? "main");
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const current = tabs.find((x) => x.id === active) ?? tabs[0];
  const images =
    productImages[current.id as keyof typeof productImages] ?? [];

  return (
    <section className="ftco-menu products-menu-section py-20 md:py-28">
      <Container className="container">
        <div className="mb-12 flex justify-center">
          <div
            className="heading-section col-md-7 w-full max-w-2xl text-center ftco-animate fadeInUp ftco-animated"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {isRtl ? (
              <span className="subheading mb-2 block text-lg font-semibold tracking-wide text-brand-primary md:text-xl">
                {t("sub")}
              </span>
            ) : (
              <span className="subheading mb-2 block font-accent text-3xl text-brand-primary md:text-4xl">
                {t("sub")}
              </span>
            )}
            <h2 className="mb-4 font-display text-3xl font-semibold uppercase tracking-wide text-white md:text-4xl">
              {t("title")}
            </h2>
            <p className="mx-auto text-base leading-relaxed text-white/65 md:text-lg">
              {t("lead")}
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/menu"
                className="inline-flex border border-white/70 bg-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white no-underline transition hover:bg-white hover:text-brand-dark"
              >
                {tc("viewMore")}
              </Link>
            </div>
          </div>
        </div>

        <div className="row d-md-flex -mx-3 flex flex-wrap">
          <div className="col-lg-12 w-full px-3 ftco-animate fadeInUp ftco-animated p-md-5 md:px-8 md:py-6 lg:px-10 lg:py-8">
            <div className="row -mx-3 flex flex-wrap">
              <div className="col-md-12 nav-link-wrap mb-8 w-full px-3 md:mb-10">
                <div
                  className="nav ftco-animate nav-pills justify-content-center fadeInUp ftco-animated flex flex-wrap justify-center gap-2 md:gap-3"
                  id="v-pills-tab"
                  role="tablist"
                >
                  {tabs.map((tab) => {
                    const isActive = tab.id === active;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`v-pills-${tab.id}-tab`}
                        aria-selected={isActive}
                        aria-controls={`v-pills-${tab.id}`}
                        className={`nav-link ftco-animate fadeInUp ftco-animated ${isActive ? "active show" : ""}`}
                        onClick={() => setActive(tab.id)}
                      >
                        {t(`tabs.${tab.labelKey}` as "tabs.main")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="col-md-12 flex w-full items-center justify-center px-3">
                <div
                  className="tab-content ftco-animate fadeInUp ftco-animated w-full"
                  id="v-pills-tabContent"
                >
                  <div
                    key={current.id}
                    className="tab-pane fade active show products-tab-pane"
                    id={`v-pills-${current.id}`}
                    role="tabpanel"
                    aria-labelledby={`v-pills-${current.id}-tab`}
                  >
                    <div className="row -mx-3 flex flex-wrap justify-center">
                      {current.items.map((item, i) => {
                        const src = images[i] ?? images[0];
                        const nameKey = `${current.id}.${item.itemKey}.name` as const;
                        const descKey = `${current.id}.${item.itemKey}.desc` as const;
                        return (
                          <div
                            key={`${current.id}-${item.itemKey}`}
                            className="col-md-4 w-full px-3 text-center md:w-1/3"
                            data-aos="fade-up"
                            data-aos-duration="800"
                            data-aos-delay={String(60 + i * 80)}
                          >
                            <div className="menu-wrap">
                              <Link
                                href="/menu"
                                className="menu-img img mb-4"
                                style={{
                                  backgroundImage: `url(${src})`,
                                }}
                                aria-label={t(nameKey)}
                              />
                              <div className="text">
                                <h3>
                                  <Link href="/menu">{t(nameKey)}</Link>
                                </h3>
                                <p>{t(descKey)}</p>
                                <p className="price">
                                  <span>€{item.price}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

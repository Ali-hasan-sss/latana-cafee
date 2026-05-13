"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import type { MenuPageData } from "@/lib/data";
import { pickLocalized } from "@/lib/menu-page-i18n";

type Props = {
  intro: MenuPageData["productsIntro"];
  addToCart: MenuPageData["addToCart"];
  tabs: MenuPageData["productTabs"];
};

export function MenuPageProductsTabs({ intro, addToCart, tabs }: Props) {
  const locale = useLocale();
  const [active, setActive] = useState(tabs[0]?.id ?? "main");
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  const isRtl = locale === "ar";

  return (
    <section className="ftco-menu products-menu-section menu-page-products mb-5 pb-5 py-20 md:py-28">
      <Container className="container">
        <div className="row mb-12 flex justify-center">
          <div
            className="heading-section col-md-7 ftco-animate fadeInUp ftco-animated w-full max-w-2xl text-center"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {isRtl ? (
              <span className="subheading mb-2 block text-lg font-semibold tracking-wide text-brand-primary md:text-xl">
                {pickLocalized(intro.subheading, locale)}
              </span>
            ) : (
              <span className="subheading mb-2 block font-accent text-3xl text-brand-primary md:text-4xl">
                {pickLocalized(intro.subheading, locale)}
              </span>
            )}
            <h2 className="mb-4 font-display text-3xl font-semibold uppercase tracking-wide text-white md:text-4xl">
              {pickLocalized(intro.title, locale)}
            </h2>
            <p className="mx-auto text-base leading-relaxed text-white/65 md:text-lg">
              {pickLocalized(intro.lead, locale)}
            </p>
          </div>
        </div>

        <div className="row d-md-flex -mx-3 flex flex-wrap">
          <div className="col-lg-12 ftco-animate fadeInUp ftco-animated w-full px-3 p-md-5 md:px-8 md:py-6 lg:px-10 lg:py-8">
            <div className="row -mx-3 flex flex-wrap">
              <div className="col-md-12 nav-link-wrap mb-8 w-full px-3 md:mb-10">
                <div
                  className="nav ftco-animate nav-pills justify-content-center fadeInUp ftco-animated flex flex-wrap justify-center gap-2 md:gap-3"
                  id="v-pills-tab"
                  role="tablist"
                >
                  {tabs.map((tab) => {
                    const isTabActive = tab.id === active;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`v-pills-${tab.id}-tab`}
                        aria-selected={isTabActive}
                        aria-controls={`v-pills-${tab.id}`}
                        className={`nav-link ftco-animate fadeInUp ftco-animated ${isTabActive ? "active show" : ""}`}
                        onClick={() => setActive(tab.id)}
                      >
                        {pickLocalized(tab.label, locale)}
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
                      {current.items.map((item, i) => (
                        <div
                          key={`${current.id}-${item.image}-${i}`}
                          className="col-md-4 w-full px-3 text-center md:w-1/3"
                          data-aos="fade-up"
                          data-aos-duration="800"
                          data-aos-delay={String(60 + i * 80)}
                        >
                          <div className="menu-wrap">
                            <a
                              href="#"
                              className="menu-img img mb-4"
                              style={{
                                backgroundImage: `url(${item.image})`,
                              }}
                              aria-label={pickLocalized(item.name, locale)}
                            />
                            <div className="text">
                              <h3>
                                <a href="#">
                                  {pickLocalized(item.name, locale)}
                                </a>
                              </h3>
                              <p>{pickLocalized(item.desc, locale)}</p>
                              <p className="price">
                                <span>${item.price}</span>
                              </p>
                              <p>
                                <a
                                  href="#"
                                  className="btn btn-primary btn-outline-primary px-4 py-3"
                                >
                                  {pickLocalized(addToCart, locale)}
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
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

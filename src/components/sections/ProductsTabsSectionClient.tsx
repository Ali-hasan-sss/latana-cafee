"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Link as I18nLink } from "@/i18n/navigation";
import { useAdminSessionVisible } from "@/components/admin/use-admin-session-visible";
import { Container } from "@/components/ui/Container";
import type { ProductsSectionPublic } from "@/lib/cms/products-section-types";

type Props = {
  data: ProductsSectionPublic;
};

export function ProductsTabsSectionClient({ data }: Props) {
  const tabs = data.tabs;
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const showAdminEdit = useAdminSessionVisible();

  const editLabel =
    locale === "ar" ? "تعديل القسم" : locale === "de" ? "Bereich bearbeiten" : "Edit section";

  useEffect(() => {
    if (!tabs.length) return;
    if (!tabs.some((t) => t.id === active)) {
      setActive(tabs[0]!.id);
    }
  }, [tabs, active]);

  const current = tabs.find((x) => x.id === active) ?? tabs[0];
  if (!current || tabs.length === 0) {
    return null;
  }

  return (
    <section className="relative ftco-menu products-menu-section py-20 md:py-28">
      <Container className="container">
        <div className="mb-12 flex justify-center">
          <div
            className="heading-section col-md-7 w-full max-w-2xl text-center ftco-animate fadeInUp ftco-animated"
            data-aos="fade-up"
            data-aos-duration="800"
          >
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
            {showAdminEdit ? (
              <div className="mt-8 flex justify-center">
                <Link
                  href="/admin/products-section"
                  className="inline-flex border border-brand-primary/80 bg-brand-primary/15 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary no-underline transition hover:bg-brand-primary hover:text-[#212529]"
                >
                  {editLabel}
                </Link>
              </div>
            ) : null}
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
                        {tab.label}
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
                        const src = item.imageSrc;
                        return (
                          <div
                            key={`${current.id}-${item.itemKey}`}
                            className="col-md-4 w-full px-3 text-center md:w-1/3"
                            data-aos="fade-up"
                            data-aos-duration="800"
                            data-aos-delay={String(60 + i * 80)}
                          >
                            <div className="menu-wrap">
                              <I18nLink
                                href="/menu"
                                className="menu-img img mb-4"
                                style={{
                                  backgroundImage: `url(${src})`,
                                }}
                                aria-label={item.name}
                              />
                              <div className="text">
                                <h3>
                                  <I18nLink href="/menu">{item.name}</I18nLink>
                                </h3>
                                <p>{item.desc}</p>
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

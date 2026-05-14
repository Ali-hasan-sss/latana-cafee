import { Container } from "@/components/ui/Container";
import type { MenuPageData } from "@/lib/data";
import { pickLocalized } from "@/lib/menu-page-i18n";

type Props = {
  columns: MenuPageData["pricingColumns"];
  locale: string;
};

export function MenuPricingSection({ columns, locale }: Props) {
  return (
    <section className="ftco-section menu-pricing-section py-16 md:py-24">
      <Container className="container">
        <div className="row -mx-3 flex flex-wrap">
          {columns.map((col) => (
            <div
              key={col.id}
              className="col-md-6 mb-5 w-full px-3 pb-3 md:mb-8 md:w-1/2"
            >
              <h3
                className="heading-pricing ftco-animate fadeInUp ftco-animated mb-8 tracking-wide text-white"
                data-aos="fade-up"
                data-aos-duration="800"
              >
                {pickLocalized(col.title, locale)}
              </h3>
              {col.items.map((item, i) => (
                <div
                  key={`${col.id}-${item.image}-${i}`}
                  className="pricing-entry ftco-animate fadeInUp ftco-animated mb-8 flex gap-4 last:mb-0 md:mb-10"
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay={String(i * 80)}
                >
                  <div
                    className="pricing-entry__img shrink-0"
                    style={{ backgroundImage: `url(${item.image})` }}
                    role="img"
                    aria-hidden
                  />
                  <div className="desc min-w-0 flex-1">
                    <div className="pricing-entry__title-row flex min-w-0 items-end gap-2">
                      <h3 className="pricing-entry__name m-0 shrink-0 pb-0.5 text-base font-semibold leading-snug text-white md:text-lg">
                        {pickLocalized(item.name, locale)}
                      </h3>
                      <div className="pricing-entry__leader-wrap mx-0.5 flex min-w-0 flex-1 flex-col justify-end pb-1">
                        <div
                          className="pricing-entry__leader h-0 w-full border-b border-dotted border-white/40"
                          aria-hidden
                        />
                      </div>
                      <span className="pricing-entry__price shrink-0 pb-0.5 text-base font-semibold text-brand-primary md:text-lg">
                        €{item.price}
                      </span>
                    </div>
                    <p className="pricing-entry__desc mt-2 mb-0 text-sm leading-relaxed text-white/55">
                      {pickLocalized(item.desc, locale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

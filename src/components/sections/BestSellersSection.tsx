import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import type { Catalog } from "@/lib/data";

type Props = {
  images: string[];
  items: Catalog["bestSellers"];
};

export async function BestSellersSection({ images, items }: Props) {
  const t = await getTranslations("bestSellers");
  const ti = await getTranslations("bestSellers.items");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const isRtl = locale === "ar";

  return (
    <section className="ftco-section best-sellers-section py-20 md:py-28">
      <Container className="container">
        <div className="mb-12 flex justify-center pb-3 md:mb-14 md:pb-5">
          <div
            className="heading-section ftco-animate fadeInUp ftco-animated col-md-7 w-full max-w-2xl text-center"
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
        <div className="row -mx-3 flex flex-wrap">
          {items.map((item, i) => (
            <div
              key={item.itemKey}
              className="col-md-3 w-full px-3 md:w-1/2 lg:w-1/4"
              data-aos="fade-up"
              data-aos-duration="800"
              data-aos-delay={String(80 + i * 100)}
            >
              <div className="menu-entry">
                <Link
                  href="/menu"
                  className="img"
                  style={{
                    backgroundImage: `url(${images[i] ?? images[0]})`,
                  }}
                  aria-label={ti(`${item.itemKey}.name`)}
                />
                <div className="text text-center pt-4">
                  <h3>
                    <Link href="/menu">{ti(`${item.itemKey}.name`)}</Link>
                  </h3>
                  <p>{ti(`${item.itemKey}.desc`)}</p>
                  <p className="price">
                    <span>€{item.price}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

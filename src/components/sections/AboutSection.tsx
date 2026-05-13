import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  image: string;
};

export async function AboutSection({ image }: Props) {
  const t = await getTranslations("about");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const isRtl = locale === "ar";

  return (
    <section id="about" className="ftco-about d-md-flex flex flex-col md:flex-row">
      {/* one-half img — خلفية الغلاف مثل القالب */}
      <div
        className="one-half img relative min-h-[380px] w-full bg-cover bg-center bg-no-repeat md:min-h-[min(100vh,640px)] md:w-1/2"
        style={{ backgroundImage: `url(${image})` }}
        data-aos="fade-up"
        data-aos-duration="800"
        aria-hidden
      />

      {/* one-half — نص مع overlap */}
      <div
        className="one-half relative z-[1] flex w-full items-stretch  md:min-h-[min(100vh,640px)] md:w-1/2 md:items-center"
        data-aos="fade-up"
        data-aos-duration="800"
        data-aos-delay="100"
      >
        <div
          className={`overlap w-full bg-[#00000080] px-6 py-10 shadow-[0_15px_57px_-12px_rgba(0,0,0,0.25)] md:px-10 md:py-12 lg:px-14 lg:py-14 ${
            isRtl
              ? "md:-me-12 md:mt-0 lg:-me-20 xl:-me-24"
              : "md:-ms-12 md:mt-0 lg:-ms-20 xl:-ms-24"
          } md:-mt-24 lg:-mt-28`}
        >
          <div
            className="heading-section ftco-animate"
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
            <h2 className="mb-4 font-display text-3xl font-semibold text-brand-light md:text-4xl">
              {t("title")}
            </h2>
          </div>
          <div>
            <p className="mb-0 text-base leading-[1.85] text-brand-light md:text-lg">
              {t("text")}
            </p>
            <div className="mt-8">
              <Link
                href="/blog"
                className="inline-flex border border-brand-primary bg-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary no-underline transition hover:bg-brand-primary hover:text-white"
              >
                {tc("viewMore")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

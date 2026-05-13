import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { getBlogArticlesData } from "@/lib/data";

type Props = {
  thumbs: string[];
};

export async function Footer({ thumbs }: Props) {
  const t = await getTranslations("footer");
  const tb = await getTranslations("blog.posts");
  const articles = getBlogArticlesData().articles;

  return (
    <footer className="bg-brand-darker text-white">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="0"
          >
            <h2 className="mb-4 text-lg font-semibold">{t("aboutTitle")}</h2>
            <p className="text-sm leading-relaxed text-white/70">
              {t("aboutText")}
            </p>
            <div className="mt-6">
              <a
                href={t("facebookUrl")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/90 transition-colors hover:border-brand-primary hover:bg-brand-primary/15 hover:text-brand-primary"
                aria-label={t("facebookLabel")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
          <div
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="100"
          >
            <h2 className="mb-4 text-lg font-semibold">
              <Link href="/blog" className="text-white no-underline hover:text-brand-primary">
                {t("blogTitle")}
              </Link>
            </h2>
            {thumbs.map((src, i) => {
              const key = i === 0 ? "one" : "two";
              const slug = articles.find((a) => a.postKey === key)?.slug;
              const href = slug ? `/blog/${slug}` : "/blog";
              return (
                <Link
                  key={src}
                  href={href}
                  className="mb-4 flex gap-4 no-underline last:mb-0"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="text-sm text-white/80">
                    <div className="font-medium text-white hover:text-brand-primary">
                      {tb(`${key}.title`)}
                    </div>
                    <div className="mt-1 text-xs text-white/50">
                      {tb(`${key}.date`)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="200"
          >
            <h2 className="mb-4 text-lg font-semibold">{t("servicesTitle")}</h2>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <a href="#services" className="hover:text-brand-primary">
                  {t("services.cooked")}
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-brand-primary">
                  {t("services.deliver")}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-brand-primary">
                  {t("services.quality")}
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-brand-primary">
                  {t("services.mixed")}
                </a>
              </li>
            </ul>
          </div>
          <div
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="280"
          >
            <h2 className="mb-4 text-lg font-semibold">
              {t("questionsTitle")}
            </h2>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex gap-2">
                <span aria-hidden>◎</span>
                <span>{t("address")}</span>
              </li>
              <li>
                <a
                  href={`tel:${t("phone").replace(/\s/g, "")}`}
                  className="flex gap-2 hover:text-brand-primary"
                >
                  <span aria-hidden>☎</span>
                  {t("phone")}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${t("email")}`}
                  className="flex gap-2 hover:text-brand-primary"
                >
                  <span aria-hidden>✉</span>
                  {t("email")}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/50">
          <p>
            © {new Date().getFullYear()} {t("rights")} {t("credit")}
          </p>
        </div>
      </Container>
    </footer>
  );
}

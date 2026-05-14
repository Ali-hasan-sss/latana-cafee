import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { getPublicBlogPostFooterCards } from "@/lib/cms/get-public-blog-posts";
import { getPublicSiteContact } from "@/lib/cms/get-public-site-contact";
import { buildWhatsAppHref } from "@/lib/cms/whatsapp-href";

type Props = {
  thumbs: string[];
};

const socialBtnClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/90 transition-colors hover:border-brand-primary hover:bg-brand-primary/15 hover:text-brand-primary";

type SocialDef = {
  key: keyof import("@/lib/cms/site-contact-types").SiteContactSocial;
  label: string;
  icon: string;
};

function SocialGlyph({ name }: { name: string }) {
  switch (name) {
    case "facebook":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "instagram":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case "youtube":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M19.59 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.495v13.702a2.896 2.896 0 1 1-5.183-1.798 2.894 2.894 0 0 1 2.303-4.647v-3.51a6.329 6.329 0 0 0-1.084-.093c-3.45 0-6.248 2.798-6.248 6.247a6.25 6.25 0 0 0 10.171 4.864v.001a6.205 6.205 0 0 0 1.78-4.375V8.688a8.922 8.922 0 0 0 5.227 1.682V6.686h-.001z" />
        </svg>
      );
    case "x":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    default:
      return null;
  }
}

export async function Footer({ thumbs }: Props) {
  const t = await getTranslations("footer");
  const locale = await getLocale();
  const contact = await getPublicSiteContact(locale);
  const blogCards = await getPublicBlogPostFooterCards(locale);

  const telHref = contact.phone.trim()
    ? `tel:${contact.phone.replace(/\s/g, "")}`
    : undefined;
  const mailHref = contact.email.trim() ? `mailto:${contact.email.trim()}` : undefined;
  const waHref = buildWhatsAppHref(contact.whatsapp);

  const socialDefs: SocialDef[] = [
    { key: "facebook", label: "Facebook", icon: "facebook" },
    { key: "instagram", label: "Instagram", icon: "instagram" },
    { key: "tiktok", label: "TikTok", icon: "tiktok" },
    { key: "linkedin", label: "LinkedIn", icon: "linkedin" },
    { key: "youtube", label: "YouTube", icon: "youtube" },
    { key: "x", label: "X", icon: "x" },
  ];

  const socialLinks = socialDefs
    .map((def) => {
      const url = contact.social[def.key]?.trim() ?? "";
      return url ? { ...def, url } : null;
    })
    .filter(Boolean) as (SocialDef & { url: string })[];

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
            {socialLinks.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map(({ key, url, label, icon }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={socialBtnClass}
                    aria-label={label}
                  >
                    <SocialGlyph name={icon} />
                  </a>
                ))}
              </div>
            ) : null}
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
              const card = blogCards[i];
              const href = card ? `/blog/${card.slug}` : "/blog";
              const imgSrc = card?.coverImageSrc?.trim() ? card.coverImageSrc : src;
              return (
                <Link
                  key={`${src}-${i}`}
                  href={href}
                  className="mb-4 flex gap-4 no-underline last:mb-0"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm">
                    <Image
                      src={imgSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="text-sm text-white/80">
                    <div className="font-medium text-white hover:text-brand-primary">
                      {card?.title ?? "—"}
                    </div>
                    <div className="mt-1 text-xs text-white/50">{card?.date ?? ""}</div>
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
            <h2 className="mb-4 text-lg font-semibold">{t("impressum.title")}</h2>
            <div className="space-y-3 text-sm leading-relaxed text-white/75">
              <p className="font-medium text-white/85">{t("impressum.gesellschaftHeading")}</p>
              <p>{t("impressum.companyLine")}</p>
              <p>
                {t("impressum.emailLabel")}{" "}
                <a
                  href="mailto:bright.future.da.gmbh@gmail.com"
                  className="text-brand-primary underline-offset-2 hover:text-brand-primary hover:underline"
                >
                  bright.future.da.gmbh@gmail.com
                </a>
              </p>
              <p>
                {t("impressum.phoneLabel")}{" "}
                <a
                  href="tel:+491608504523"
                  className="text-brand-primary underline-offset-2 hover:text-brand-primary hover:underline"
                >
                  +49 160 8504523
                </a>
              </p>
              <p className="font-medium text-white/85">{t("impressum.sitzHeading")}</p>
              <p>{t("impressum.sitzLine")}</p>
              <p>
                {t("impressum.stNrLabel")} {t("impressum.stNrValue")}
              </p>
              <p>
                {t("impressum.ustIdLabel")} {t("impressum.ustIdValue")}
              </p>
              <p>
                {t("impressum.gfLabel")} {t("impressum.gfName")}
              </p>
            </div>
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
                <span className="whitespace-pre-line">{contact.address}</span>
              </li>
              {telHref ? (
                <li>
                  <a href={telHref} className="flex gap-2 hover:text-brand-primary">
                    <span aria-hidden>☎</span>
                    {contact.phone}
                  </a>
                </li>
              ) : contact.phone ? (
                <li className="flex gap-2">
                  <span aria-hidden>☎</span>
                  {contact.phone}
                </li>
              ) : null}
              {waHref ? (
                <li>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-2 hover:text-brand-primary"
                  >
                    <span aria-hidden>◆</span>
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {mailHref ? (
                <li>
                  <a href={mailHref} className="flex gap-2 hover:text-brand-primary">
                    <span aria-hidden>✉</span>
                    {contact.email}
                  </a>
                </li>
              ) : contact.email ? (
                <li className="flex gap-2">
                  <span aria-hidden>✉</span>
                  {contact.email}
                </li>
              ) : null}
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

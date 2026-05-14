import { getLocale, getTranslations } from "next-intl/server";
import { IntroBookingForm } from "@/components/sections/IntroBookingForm";
import { getPublicSiteContact } from "@/lib/cms/get-public-site-contact";
import { buildWhatsAppHref } from "@/lib/cms/whatsapp-href";

function IconPhone({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconLocation({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

type IntroBarProps = {
  /** When false, booking form is rendered elsewhere (e.g. menu hero overlap). */
  showBooking?: boolean;
  /** Extra top padding so content clears the hero-overlap booking card. */
  heroOverlap?: boolean;
};

export async function IntroBar({
  showBooking = true,
  heroOverlap = false,
}: IntroBarProps = {}) {
  const t = await getTranslations("intro");
  const locale = await getLocale();
  const contact = await getPublicSiteContact(locale);

  const telHref = contact.phone.trim()
    ? `tel:${contact.phone.replace(/\s/g, "")}`
    : undefined;
  const waHref = buildWhatsAppHref(contact.whatsapp);

  const sectionClass = heroOverlap
    ? "ftco-intro menu-page-intro-after-hero relative z-20 w-full pt-24 md:pt-32"
    : "ftco-intro relative z-30 -mt-10 w-full md:-mt-14";

  return (
    <section id="book" className={sectionClass}>
      <div className="container-wrap w-full overflow-x-clip shadow-[0_12px_40px_rgba(0,0,0,0.15)] md:overflow-visible">
        <div className="wrap d-md-flex flex flex-col md:flex-row md:items-stretch xl:items-end">
          <div className="info min-w-0 flex-1 bg-[#1a1a1a] text-white">
            <div className="row no-gutters grid md:grid-cols-3">
              <div
                className="col-md-4 ftco-animate flex gap-0 border-b border-white/[0.08] px-6 py-9 md:border-b-0 md:border-e md:border-white/[0.08] md:px-8 md:py-10"
                data-aos="fade-up"
                data-aos-duration="800"
                data-aos-delay="0"
              >
                <div className="icon flex w-[60px] shrink-0 justify-center text-brand-primary">
                  <span className="icon-phone inline-flex">
                    <IconPhone className="h-7 w-7" />
                  </span>
                </div>
                <div className="text min-w-0 ps-2 md:ps-0">
                  <span className="sr-only">{t("phoneTitle")}</span>
                  <h3 className="mb-2 text-lg font-normal leading-snug text-white md:text-[1.25rem]">
                    {telHref ? (
                      <a
                        href={telHref}
                        className="text-white no-underline transition-colors hover:text-brand-primary"
                      >
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-white/80">{contact.phone || "—"}</span>
                    )}
                  </h3>
                  <p className="mb-0 text-sm leading-relaxed text-[rgba(255,255,255,0.55)]">
                    {t("phoneText")}
                  </p>
                  {waHref ? (
                    <p className="mb-0 mt-2 text-sm">
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-primary no-underline transition hover:underline"
                      >
                        WhatsApp
                      </a>
                    </p>
                  ) : null}
                </div>
              </div>
              <div
                className="col-md-4 ftco-animate flex gap-0 border-b border-white/[0.08] px-6 py-9 md:border-b-0 md:border-e md:border-white/[0.08] md:px-8 md:py-10"
                data-aos="fade-up"
                data-aos-duration="800"
                data-aos-delay="100"
              >
                <div className="icon flex w-[60px] shrink-0 justify-center text-brand-primary">
                  <span className="icon-my_location inline-flex">
                    <IconLocation className="h-7 w-7" />
                  </span>
                </div>
                <div className="text min-w-0 ps-2 md:ps-0">
                  <h3 className="mb-2 text-lg font-normal leading-snug text-white md:text-[1.25rem]">
                    {t("addressTitle")}
                  </h3>
                  <p className="mb-0 whitespace-pre-line text-sm leading-relaxed text-[rgba(255,255,255,0.55)]">
                    {contact.address}
                  </p>
                </div>
              </div>
              <div
                className="col-md-4 ftco-animate flex gap-0 px-6 py-9 md:px-8 md:py-10"
                data-aos="fade-up"
                data-aos-duration="800"
                data-aos-delay="200"
              >
                <div className="icon flex w-[60px] shrink-0 justify-center text-brand-primary">
                  <span className="icon-clock-o inline-flex">
                    <IconClock className="h-7 w-7" />
                  </span>
                </div>
                <div className="text min-w-0 ps-2 md:ps-0">
                  <h3 className="mb-2 text-lg font-normal leading-snug text-white md:text-[1.25rem]">
                    {t("hoursTitle")}
                  </h3>
                  <p className="mb-0 whitespace-pre-line text-sm leading-relaxed text-[rgba(255,255,255,0.55)]">
                    {contact.hours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {showBooking ? <IntroBookingForm /> : null}
        </div>
      </div>
    </section>
  );
}

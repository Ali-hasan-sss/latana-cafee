import { getLocale } from "next-intl/server";
import { AdminFloatingEditLink } from "@/components/admin/AdminFloatingEditLink";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicServicesSection } from "@/lib/cms/get-public-services-section";

function IconChoices({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path d="M16 20h8M16 32h8M16 44h8" strokeLinecap="round" />
      <path d="M32 22l6 6 12-14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 34l6 6 12-10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 46l6 6 12-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAtmosphere({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path d="M12 44h40v8H12z" strokeLinejoin="round" />
      <path d="M18 44V28l14-10 14 10v16" strokeLinejoin="round" />
      <path
        d="M24 20c2-6 8-10 16-8M40 16c4 2 6 6 6 10"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCoffeeBean({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path
        d="M28 12c12-4 24 8 20 24s-18 28-30 24-20-20-8-36c8-10 14-8 18-12z"
        strokeLinejoin="round"
      />
      <path d="M26 22c8 10 12 20 10 28" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function ServiceIcon({ type }: { type: string }) {
  const cls = "h-[60px] w-[60px] shrink-0 text-[#1d150b]";
  switch (type) {
    case "choices":
      return <IconChoices className={cls} />;
    case "atmosphere":
      return <IconAtmosphere className={cls} />;
    case "coffee-bean":
      return <IconCoffeeBean className={cls} />;
    default:
      return <IconChoices className={cls} />;
  }
}

export async function ServicesSection() {
  const locale = await getLocale();
  const { section, items } = await getPublicServicesSection(locale);

  return (
    <section
      id="services"
      className="relative ftco-section ftco-services bg-brand-primary py-16 md:py-20 lg:py-24"
    >
      <AdminFloatingEditLink href="/admin/services-section" />
      <Container>
        <SectionHeading
          sub={section.sub}
          title={section.title}
          lead={section.lead}
          className="mb-14 md:mb-16 [&_h2]:text-[#1d150b] [&_p]:text-[#1d150b]/88 [&_span]:text-[#1d150b]"
        />
        <div className="row flex flex-wrap justify-center gap-y-12 md:-mx-3 md:gap-y-0">
          {items.map((item, i) => {
            return (
              <div
                key={item.id}
                className="col-md-4 ftco-animate w-full px-3 md:w-1/3"
                data-aos="fade-up"
                data-aos-duration="800"
                data-aos-delay={String(i * 120)}
              >
                <div className="media  services block-6 block text-center">
                  <div className="icon mb-5 flex  items-center justify-center md:mb-8">
                    <span
                      className="flaticon-wrapper border border-black relative z-[1] flex items-center justify-center text-center"
                      aria-hidden
                    >
                      <ServiceIcon type={item.icon} />
                    </span>
                  </div>
                  <div className="media-body px-2">
                    <h3 className="heading mb-3 text-lg font-semibold text-[#1d150b] md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mb-0 text-sm leading-relaxed text-[#1d150b]/90 md:text-[15px]">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
